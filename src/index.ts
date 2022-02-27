import * as contracts from "./data-contracts";

import {
  QueryIndex,
  FindDoctorsQueryParams,
  DoctorSummary,
  DoctorDetail,
  Appointment,
} from "./query-index";

const _ = require("lodash"); // Using require instead of import here as ava seems to break with import

export interface Sources {
  /** Doctor scores exported from the data pipeline */
  doctorScores: contracts.DoctorScore[];
  /** Feature scores exported from the data pipeline */
  featureScores: contracts.FeatureScore[];
  /** Most recent import of doctor appointments that are available */
  availableAppointments: contracts.Appointment[];
}

export interface QueryIndexConfiguration {
  /** The minimum score required for a doctor to be listed. Range: 0–100 */
  minDoctorScore: number;
  /** The minimum score required for a feature to be listed for a doctor. Range: 0–100 */
  minFeatureScore: number;
}

// Type for a Doctors hashmap containing an aggregate of relevant data to process
type DoctorIndex = DoctorDetail & { score: number };
type DoctorsIndex = { [key: string]: DoctorIndex };

export function buildIndex(
  config: QueryIndexConfiguration,
  sources: Sources
): QueryIndex {
  const { minDoctorScore, minFeatureScore } = config;
  const { doctorScores, featureScores, availableAppointments } = sources;

  // Start building up our doctors map with an empty object
  const doctorsIndex: DoctorsIndex = {};

  // Only add doctors with a passing score
  doctorScores.forEach(({ npi, name, score, zipCode }) => {
    if (score >= minDoctorScore) {
      doctorsIndex[npi] = {
        npi,
        name,
        zipCode,
        features: [],
        availability: [],
        score,
      };
    }
  });

  // Update our doctors index with features passing our minimum feature score
  featureScores.forEach(({ npi, feature, score }) => {
    const doctorDetail = doctorsIndex[npi];
    if (Boolean(doctorDetail) && score >= minFeatureScore) {
      doctorDetail.features.push(feature);
    }
  });

  // Update availability for matching doctors with time and convert time difference to minutes
  availableAppointments.forEach(({ npi, startTime, endTime }) => {
    const doctorDetail = doctorsIndex[npi];
    if (Boolean(doctorDetail)) {
      const lengthMinutes = Math.floor((+endTime - +startTime) / 60000);
      doctorDetail.availability.push({
        time: startTime,
        lengthMinutes,
      });
    }
  });

  return {
    findDoctors: findDoctors(doctorsIndex),
    getDoctorDetail: getDoctorDetail(doctorsIndex),
  };
}

function findDoctors(doctorsIndex: DoctorsIndex) {
  return function (params: FindDoctorsQueryParams): DoctorSummary[] {
    const { currentTime, zipCode, appointmentLengthMinutes, limit } = params;
    const appointmentQuery = { currentTime, appointmentLengthMinutes };

    // Returns a new array containing doctors with matching zip code and an availability past the currentTime parameter
    const filteredDoctors = _.reduce(
      doctorsIndex,
      (result: DoctorDetail[], doctor: DoctorDetail) => {
        const matchesZipCode = doctor.zipCode === zipCode;
        const matchesAvailability = containsAvailability(
          doctor.availability,
          appointmentQuery
        );

        if (matchesZipCode && matchesAvailability) {
          // Update doctor availability with a filtered appointment list and sorted by ascending order
          const { availability, ...rest } = doctor;
          const filteredAvailability = _.filter(
            availability,
            (appointment: Appointment) =>
              isAvailable(appointmentQuery, appointment)
          );
          const sortedAvailability = _.sortBy(filteredAvailability, ["time"]);

          result.push({ ...rest, availability: sortedAvailability });
        }

        return result;
      },
      []
    );

    // Sort our list by score in descending order
    const sortedDoctors = _.orderBy(filteredDoctors, ["score"], ["desc"]).slice(
      0,
      limit
    );

    // Map our custom aggregate index type to conform to DoctorSummary type
    return sortedDoctors.map(({ npi, name, availability }) => ({
      npi,
      name,
      firstAvailability: availability[0]["time"],
    }));
  };
}

function getDoctorDetail(doctorsIndex: DoctorsIndex) {
  return function (currentTime: Date, npi: string): DoctorDetail | null {
    const doctorDetail = doctorsIndex[npi];

    // Return null if doctor is not found in our index
    if (!doctorDetail) {
      return null;
    }

    const { name, zipCode, features, availability } = doctorDetail;

    return {
      npi,
      name,
      zipCode,
      features,
      availability: availability.filter(({ time }) => {
        return time > currentTime;
      }),
    };
  };
}

type AppointmentQuery = { currentTime: Date; appointmentLengthMinutes: number };

// Quick check to see if an appointments array contains an available time and appointment length
function containsAvailability(
  availability: Appointment[],
  query: AppointmentQuery
) {
  return (
    availability.findIndex((appointment: Appointment) =>
      isAvailable(query, appointment)
    ) !== -1
  );
}

// Checks if a provided currentTime and appointmentLengthMinutes matches availabiltiy within a given appointment's time and lengthMinutes
function isAvailable(
  { currentTime, appointmentLengthMinutes }: AppointmentQuery,
  { time, lengthMinutes }: Appointment
) {
  return currentTime < time && appointmentLengthMinutes === lengthMinutes;
}
