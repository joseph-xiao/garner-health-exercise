/** Scoring result for a doctor. */
export interface DoctorScore {
  /** National Provider Identifier. Unique key. */
  npi: string;
  /** Full name of the doctor. */
  name: string;
  /** Scoring result from the data pipeline. */
  score: number;
  /** The location of the doctor. */
  zipCode: string;
}

/**
 * Enumerates a feature ascribed to a doctor.
 *
 * Features describe some of the more intuitive metrics a doctor is scored on.
 * These features are then advertised to a user to help them understand why Garner recommended a doctor.
 * Features also have scores indicating Garner's opinion on how well a doctor adheres to a policy.
 * Not all doctors will be scored on every feature, depending on the availability of data.
 * (One doctor can have zero-to-many feature scores.)
 */
export enum Feature {
  /** Orders labs only when clinically indicated. */
  OnlyNecessaryLabs = 1,
  /** Orders studies requiring an incision only when clinically indicated. */
  OnlyNecessaryInvasiveStudies = 2,
  /** Orders MRI, CT, X-Ray, and other imaging studies only when clinically indicated. */
  OnlyNecessaryImagingStudies = 3,
  /** Only orders surgery when physical therapy does not yield results */
  PTBeforeSurgery = 4,
  /** Orders medications only when clinically indicated */
  OnlyIndicatedMedications = 5,
}

/** Scoring result for a feature ascribed to a doctor. */
export interface FeatureScore {
  /** The NPI of the scored doctor. */
  npi: string;
  /** The feature being scored. */
  feature: Feature;
  /** Scoring result from the data pipeline. Range 0–100. */
  score: number;
}

/**
 * An appointment slot offered by a doctor.
 * Appointments cannot be divided or combined.
 * */
export interface Appointment {
  /** The NPI of the doctor offering the appointment. */
  npi: string;
  /**
   * The date and time of the beginning of the appointment.
   * (In local timezone)
  */
  startTime: Date;
  /**
   * The date and time of the end of the appointment.
   * (In local timezone)
   */
  endTime: Date;
}
