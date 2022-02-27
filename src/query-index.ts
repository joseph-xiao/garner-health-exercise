import { Feature } from "./data-contracts";

/** Parameters for {@link QueryIndex.findDoctors} */
export interface FindDoctorsQueryParams {
  /** The time to use as "now" for the query. */
  currentTime: Date;
  /** The zip code to search for. (Direct match) */
  zipCode: string;
  /** The length of the appointment to search for. (Direct match) */
  appointmentLengthMinutes: number;
  /** The maximum number of results to return. */
  limit: number;
}

/** Summary information for a doctor, suitable for a list. */
export interface DoctorSummary {
  /** The NPI of the doctor. */
  npi: string;
  /** The full name of the doctor. */
  name: string;
  /** The date and time of the doctor's first availability. */
  firstAvailability: Date;
}

/** An appointment a doctor offers. */
export interface Appointment {
  /** The date and time of the start of the appointment. */
  time: Date;
  /** The length of the appointment in minutes. */
  lengthMinutes: number;
}

/** Detailed information for a doctor. */
export interface DoctorDetail {
  /** the NPI of the doctor. */
  npi: string;
  /** The full name of the doctor. */
  name: string;
  /** The zip code of the office where the doctor practices. */
  zipCode: string;
  /** The features ascribed to this doctor. */
  features: Feature[];
  /** Upcoming available appointments this doctor offers. */
  availability: Appointment[];
}

/** Provides standardized queries on top of an optimized index. */
export interface QueryIndex {
  /**
   * Retrieves a list of recommended doctors based on the query parameters
   * @param params Query parameters
   * @returns a list of recommended doctors, sorted by doctor score descending
   */
  findDoctors(params: FindDoctorsQueryParams): DoctorSummary[];

  /**
   * Gets the detailed record for a specific doctor.
   * @param currentTime The time to use for filtering provided appointments.
   * @param npi The NPI of the doctor to retrieve.
   * @returns A single doctor record with appointment availability after `currentTime`
   */
  getDoctorDetail(currentTime: Date, npi: string): DoctorDetail | null;
}
