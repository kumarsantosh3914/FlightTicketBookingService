const { StatusCodes } = require("http-status-codes");
const BookingRepository = require("../../src/repository/booking-repository");
const { Booking } = require("../../src/models/index");
const { AppError, ValidationError } = require("../../src/utils/errors/index");

describe("BookingRepository", () => {
  let bookingRepository;

  beforeEach(() => {
    bookingRepository = new BookingRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a booking", async () => {
      const data = {
        // Provide your data for creating a booking
      };

      Booking.create.mockResolvedValueOnce(data);

      const result = await bookingRepository.create(data);

      expect(result).toEqual(data);
      expect(Booking.create).toHaveBeenCalledWith(data);
    });

    it("should handle validation error", async () => {
      const validationError = new Error("Validation error");
      Booking.create.mockRejectedValueOnce({
        name: "SequelizeValidationError",
        errors: [validationError],
      });

      await expect(bookingRepository.create({})).rejects.toThrow(
        ValidationError
      );
      expect(Booking.create).toHaveBeenCalledWith({});
    });

    it("should handle other errors", async () => {
      Booking.create.mockRejectedValueOnce(new Error("Database error"));

      await expect(bookingRepository.create({})).rejects.toThrow(AppError);
      expect(Booking.create).toHaveBeenCalledWith({});
    });
  });

  describe("update", () => {
    it("should update a booking status", async () => {
      const bookingId = 1;
      const data = {
        status: "completed",
      };

      const bookingInstance = {
        save: jest.fn(),
      };

      Booking.findByPk.mockResolvedValueOnce(bookingInstance);

      const result = await bookingRepository.update(bookingId, data);

      expect(result).toEqual(bookingInstance);
      expect(bookingInstance.status).toEqual("completed");
      expect(bookingInstance.save).toHaveBeenCalled();
      expect(Booking.findByPk).toHaveBeenCalledWith(bookingId);
    });

    it("should handle errors", async () => {
      const bookingId = 1;
      const data = {
        // Provide data for updating
      };

      Booking.findByPk.mockRejectedValueOnce(new Error("Database error"));

      await expect(bookingRepository.update(bookingId, data)).rejects.toThrow(
        AppError
      );
      expect(Booking.findByPk).toHaveBeenCalledWith(bookingId);
    });
  });
});
