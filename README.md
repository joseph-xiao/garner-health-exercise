# Garner Health Coding Exercise

Thank you for your interest in joining the Garner Health engineering team!
We are passionate about bringing positive change to the healthcare industry through our product and in the craft of delivering quality software that is able to nimbly adapt to new requirements.

In this exercise, we want to see how you solve the given problem and demonstrate the patterns and practices you feel lead to high quality software.

## Evaluation Criteria

Your test will be reviewed by an engineer along several criteria. If it meets these criteria, we will follow up with an interactive code review session to discuss your approach.

1. Does the solution pass all of the integration tests?
2. Is the code easily understandable?
3. Does the code follow modern best practices?
4. Is the code decoupled so that it can be easily unit-tested?
5. How computationally and memory efficient is the solution?
6. Is the code readily open to extension?

Keep in mind that the tests verify the expected behavior and the scale is much higher in real life.

## Exercise Rules

For the purposes of this exercise, please adhere to the following rules.

1. **Do not copy or distribute our test or your solution in part or in whole**
2. You can use outside reference material (documentation, tutorials, etc), but all work must be your own
3. You may change any file in the solution **except** `integration.test.ts`
4. Force-pushing to the `main` branch has been disabled
5. Only the contents of the `main` branch will be evaluated
6. You may use whatever libraries you like provided that their licenses permit their use in this scenario
7. Don't use a database, file storage, or anything that creates a separate process

# Context

Garner Health recommends doctors to patients based on a scoring system that is computed by a data pipeline that processes several sources of data, including insurance claims.
Scores represent Garner's opinion on a doctor's ability to deliver positive health outcomes for patients at a competitive cost, from 0 to 100 where 100 is the best possible score.

**Your task is to ingest three data sources and provide two query functions on top of an in-memory index.**

## Data Sources

The data pipeline is run from time to time and its results are provided as inputs to the query index.
The inputs are:

1. **Doctor Scores**, giving the headline score for each doctor
2. **Feature Scored**, describing to what degree Garner feels a doctor adheres to certain best practices
3. **Available Appointments**, the most recent export from our batch job integrating with doctors' practice management systems

See JSDoc information in [`data-contracts.ts`](src/data-contracts.ts) for detailed information.

## Acceptance Criteria

### `buildIndex`

1. Accepts `minDcotorScore` and `minFeatureScore` as parameters
2. Returns a [`QueryIndex`](src/query-index.ts)
3. Filters out doctors with a score less than `minDoctorScore`
4. Filters out features with a score less than `minFeatureScore`

### `findDoctors`

1. Accepts `currentTime`, `zipCode`, `appointmentLengthMinutes`, and `limit` as parameters
2. Returns a list of [`DoctorSummary`](src/query-index.ts)
3. Doctors are sorted by score, descending
4. Returns no more than `limit` results
5. Only returns doctors who are in `zipCode`
6. Only returns doctors that have an appointment after `currentTime` for exactly `appointmentLengthMinutes`.
   **Note:** Appointments cannot be combined or divided.

### `getDoctorDetail`

1. Accepts `currentTime` and `npi` as parameters
2. If the doctor identified by `npi` is found, returns a [`DoctorDetail`](src/query-index.ts)
3. If the doctor is not found, returns `null`
4. Returns only available appointments after `currentTime`
