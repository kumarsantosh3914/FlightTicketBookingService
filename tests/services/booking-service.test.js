const axios = require("axios");
const BookingService = require("../../src/services/booking-service"); // Update the path as needed
const {
  BookingRepository,
} = require("../../src/repository/booking-repository");
const { FLIGHT_SERVICE_PATH } = require("../../src/config/serverConfig");
const { ServiceError, ValidationError } = require("../../src/utils/errors");

jest.mock("axios");

describe("BookingService", () => {
  let bookingService;
  let mockBookingRepository;

  beforeEach(() => {
    mockBookingRepository = {
      create: jest.fn(),
      update: jest.fn(),
    };

    bookingService = new BookingService();
    bookingService.bookingRepository = mockBookingRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createBooking", () => {
    it("should create a booking", async () => {
      const flightId = 123;
      const data = {
        flightId,
        noOfSeats: 2,
        // ... other properties
      };

      const flightData = {
        price: 100,
        totalSeats: 10,
        // ... other properties
      };

      axios.get.mockResolvedValueOnce({ data: { data: flightData } });
      mockBookingRepository.create.mockResolvedValueOnce(data);
      axios.patch.mockResolvedValueOnce({});
      mockBookingRepository.update.mockResolvedValueOnce(data);

      const result = await bookingService.createBooking(data);

      expect(result).toEqual(data);
      expect(axios.get).toHaveBeenCalledWith(
        `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`
      );
      expect(mockBookingRepository.create).toHaveBeenCalledWith({
        ...data,
        totalCost: flightData.price * data.noOfSeats,
      });
      expect(axios.patch).toHaveBeenCalledWith(
        `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`,
        {
          totalSeats: flightData.totalSeats - data.noOfSeats,
        }
      );
      expect(mockBookingRepository.update).toHaveBeenCalledWith(data.id, {
        status: "Booked",
      });
    });

    it("should handle insufficient seats", async () => {
      const flightId = 123;
      const data = {
        flightId,
        noOfSeats: 5,
        // ... other properties
      };

      const flightData = {
        price: 100,
        totalSeats: 2,
        // ... other properties
      };

      axios.get.mockResolvedValueOnce({ data: { data: flightData } });

      await expect(bookingService.createBooking(data)).rejects.toThrow(
        ServiceError
      );
      expect(axios.get).toHaveBeenCalledWith(
        `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`
      );
    });

    it("should handle other errors", async () => {
      const flightId = 123;
      const data = {
        flightId,
        noOfSeats: 2,
        // ... other properties
      };

      axios.get.mockRejectedValueOnce(new Error("Network error"));

      await expect(bookingService.createBooking(data)).rejects.toThrow(
        ServiceError
      );
      expect(axios.get).toHaveBeenCalledWith(
        `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`
      );
    });

    it("should handle repository errors", async () => {
      const flightId = 123;
      const data = {
        flightId,
        noOfSeats: 2,
        // ... other properties
      };

      const flightData = {
        price: 100,
        totalSeats: 10,
        // ... other properties
      };

      axios.get.mockResolvedValueOnce({ data: { data: flightData } });
      mockBookingRepository.create.mockRejectedValueOnce(
        new ValidationError("Validation error")
      );

      await expect(bookingService.createBooking(data)).rejects.toThrow(
        ValidationError
      );
      expect(axios.get).toHaveBeenCalledWith(
        `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`
      );
      expect(mockBookingRepository.create).toHaveBeenCalledWith({
        ...data,
        totalCost: flightData.price * data.noOfSeats,
      });
    });
  });

  // Add more tests for other methods...
});
