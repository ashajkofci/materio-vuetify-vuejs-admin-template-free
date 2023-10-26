export default {
  MESSAGE_FINISHED: 100,
  MESSAGE_ACQUISITION_DATA:101,
  MESSAGE_FINISHED_SAVE:102,
  MESSAGE_ACQUISITION_ERROR:103,
  MESSAGE_POWER_CALIBRATION_DATA:104,
  VERSION: 0.1,
  BEADS_URFP302: "URFP302",
  BEADS_NFPPS524K: "NFPPS524K",
  DAC_SETPOINTS_BEADS:
      {
        "URFP302": 300,
        "NFPPS524K": 1500,
      },

  AVAILABLE_CHANNELS: {"SSC":0, "FL1":1, "FL2":2, "FSC":3},
  ACQUISITION_INTEGRATION_TIMES: [1, 2, 5, 10, 15, 20, 30],
  REFRESH_RATES: [0.5,1,2,5,10],
  PLOT_LIMITS: {
    "FL1" : {
      "min": 3.1,
      "max": 6.7,
    },
    "FL2": {
      "min": 1.5,
      "max": 6.5,
    },
    "SSC": {
      "min": 2,
      "max": 6.5,
    },
    "FSC": {
      "min": 2,
      "max": 6.5,
    },
  },
}
