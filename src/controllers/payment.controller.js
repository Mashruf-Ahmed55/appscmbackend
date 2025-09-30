import createHttpError from 'http-errors';
import Stripe from 'stripe';
import User from '../models/auth.model';
import Booking from '../models/booking.model';
import Coupon from '../models/coupon.model';
import Payment from '../models/payment.model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

// ✅ Create Stripe Checkout Session
export const createStripeSession = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const userId = req.user.id;
    const booking = await Booking.findById(bookingId).populate('courtId');

    if (!bookingId) {
      return next(createHttpError(400, 'Booking ID and amount are required'));
    }
    let priceAmount;
    if (req.body.couponCode) {
      const getCoupon = await Coupon.findOne({
        code: req.body.couponCode,
      });
      if (!getCoupon) {
        return next(createHttpError(400, 'Coupon not Valid'));
      }
      if (getCoupon.expiresAt < new Date()) {
        return next(createHttpError(400, 'Coupon Expired'));
      }
      const discountPercent = getCoupon.discountPercent;
      const discountAmount = (booking.price * discountPercent) / 100;
      priceAmount = booking.price - discountAmount;
    } else {
      priceAmount = booking.price;
    }

    if (!booking) {
      return next(createHttpError(404, 'Booking not found'));
    }

    if (booking.status !== 'approved') {
      if (booking.status === 'rejected') {
        return next(createHttpError(400, 'Booking Rejected'));
      } else if (booking.status === 'confirmed') {
        return next(createHttpError(400, 'Booking Already Confirmed'));
      }
      return next(createHttpError(400, 'Booking not approved'));
    }

    const getUser = await User.findById(userId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: getUser?.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: booking.courtId.title,
            },
            unit_amount: priceAmount * 100,
          },

          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/member/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/member/payment-cancelled`,
      invoice_creation: {
        enabled: true,
      },
      metadata: {
        userId: userId.toString(),
        bookingId: bookingId,
        couponCode: req.body.couponCode || null,
      },
    });

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Confirm Payment After Redirect
export const confirmStripePayment = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return next(createHttpError(400, 'Session ID is required'));
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['invoice'],
    });

    if (session.payment_status !== 'paid') {
      return next(createHttpError(400, 'Payment not completed'));
    }

    if (session.status !== 'complete') {
      return next(createHttpError(400, 'Payment not completed'));
    }

    const { userId, bookingId } = session.metadata;

    // // ✅ Save payment
    const createPayment = await Payment.create({
      userId,
      bookingId,
      amount: session.amount_total / 100,
      couponCode: session.metadata?.couponCode || null,
      date: new Date(),
      status: 'confirmed',
    });

    // // ✅ Update booking
    const booking = await Booking.findById(bookingId).populate('courtId');
    if (booking) {
      booking.status = 'confirmed';
      await booking.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment confirmed and booking updated',
      session,
      booking,
      createPayment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 6;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.courtTitle = { $regex: req.query.search, $options: 'i' };
    }

    const pipeline = [
      {
        $lookup: {
          from: 'bookings',
          localField: 'bookingId',
          foreignField: '_id',
          as: 'booking',
        },
      },
      { $unwind: '$booking' },
      {
        $lookup: {
          from: 'courts',
          localField: 'booking.courtId',
          foreignField: '_id',
          as: 'court',
        },
      },
      { $unwind: '$court' },
      {
        $project: {
          amount: 1,
          status: 1,
          createdAt: 1,
          couponCode: 1,
          bookingSlots: '$booking.slots',
          bookingDate: '$booking.date',
          bookingStatus: '$booking.status',
          courtTitle: '$court.title',
          courtType: '$court.type',
          courtPrice: '$court.price',
        },
      },
      { $match: query },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ];

    const result = await Payment.aggregate(pipeline);
    const allPayments = result[0].data;
    const totalPayments = result[0].metadata[0]?.total || 0;
    const totalPages = Math.ceil(totalPayments / limit);

    return res.status(200).json({
      success: true,
      message: 'All payments',
      allPayments,
      pagination: {
        currentPage: page,
        totalPages,
        totalPayments,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};
