import createHttpError from 'http-errors';
import User from '../models/auth.model';
import Booking from '../models/booking.model';

// Create a new booking
export const createBooking = async (request, response, next) => {
  try {
    const userId = request.user.id;
    const { courtId, slots, date, price } = request.body;

    const user = await User.findById(userId);

    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    if (user.role === 'admin' && !user.isMember) {
      return next(
        createHttpError(400, 'You are admin. You can not booking court')
      );
    }

    if (!courtId || !slots || !date) {
      return next(createHttpError(400, 'All booking fields are required'));
    }

    const convertCourt = JSON.parse(slots);
    const booking = await Booking.create({
      userId,
      courtId,
      slots: convertCourt,
      date,
      price,
    });

    return response.status(201).json({
      success: true,
      message: 'Booking request submitted',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

//Get all bookings

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, isUser, search } = req.query;

    // Build base query
    let baseQuery = {};

    if (isUser) {
      baseQuery.userId = req.user.id;
    }

    if (status) {
      baseQuery.status = status;
    }

    // First, get bookings with basic filters
    let bookingsQuery = Booking.find(baseQuery).sort({ createdAt: -1 });

    // Populate user and court data
    bookingsQuery = bookingsQuery
      .populate('userId', 'name email isMember')
      .populate('courtId', 'title type image')
      .sort({ createdAt: -1 });

    let bookings = await bookingsQuery;
    // Apply search filter after population (client-side filtering for small datasets)
    if (search) {
      const searchTerm = search.toLowerCase().trim();
      bookings = bookings.filter((booking) =>
        booking.courtId.title.toLowerCase().includes(searchTerm)
      );
    }

    // Transform the data to match your desired format
    const transformedBookings = bookings.map((booking) => ({
      _id: booking._id,
      slots: booking.slots,
      date: booking.date,
      price: booking.price,
      status: booking.status,
      user: {
        name: booking.userId.name,
        email: booking.userId.email,
        isMember: booking.userId.isMember,
      },
      court: {
        title: booking.courtId.title,
        type: booking.courtId.type,
        image: booking.courtId.image,
      },
    }));


    res.status(200).json({
      success: true,
      total: transformedBookings.length,
      bookings: transformedBookings,
    });
  } catch (err) {
    next(err);
  }
};

// Get Logged in user bookings
export const getMyBookings = async (request, response, next) => {
  try {
    const { id } = request.user;
    const bookings = await Booking.find({ userId: id })
      .populate('userId', 'name email image')
      .populate('courtId', 'title type image')
      .sort({ createdAt: -1 });

    return response.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return next(createHttpError(404, 'Booking not found'));
    }

    const getUser = await User.findById(booking.userId);
    if (!getUser) {
      return next(createHttpError(404, 'User not found'));
    }

    // update logic
    if (booking.status === 'pending' && status === 'approved') {
      booking.status = status;
      getUser.isMember = true;
      getUser.role = 'member';
      await booking.save();
      await getUser.save();
    } else if (booking.status === 'pending' && status === 'rejected') {
      booking.status = status;
      await booking.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Booking status updated',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return next(createHttpError(404, 'Booking not found'));
    }
    return res.status(200).json({
      success: true,
      message: 'Booking deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('userId', 'name email isMember')
      .populate('courtId', 'title type image');
    if (!booking) {
      return next(createHttpError(404, 'Booking not found'));
    }
    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};
