export enum UILevel {
  None, // Extremely Limited UI
  Minimal, // Just required elements
  Standard, // Just basic functions
  Advanced, // Full UI
  Count
}

export enum DistanceUnit {
  Millimetres,
  Centimetres,
  Metres,
  Kilometres,
  USSurveyInches,
  USSurveyFeet,
  USSurveyMiles,
  NauticalMiles,
  Count
}

export enum AreaUnit {
  SquareMetres,
  SquareKilometres,
  Hectare,
  SquareFoot,
  SquareMiles,
  Acre,
  Count
}

export enum VolumeUnit {
  CubicMetre,
  Litre,
  MegaLitre,
  USSurveyCubicInch,
  USSurveyCubicFoot,
  USSurveyCubicYard,
  USQuart,
  USGallons,
  Count
}

export enum SpeedUnit {
  MetresPerSecond,
  KilometresPerHour,
  USSurveyMilesPerHour,
  FeetPerSecond,
  NauticalMilesPerHour, //Knots
  Mach,
  Count
}

export enum TemperatureUnit {
  Celcius,
  Kelvin,
  Farenheit,
  Count
}

export enum TimeReference {
  TAI, //seconds since UTC 00:00:00, 1/1/1958
  Unix, //seconds since UTC 00:00:00, 1/1/1970, not including leap seconds
  GPS, //seconds since UTC 00:00:00, 6/1/1980
  GPSAdjusted, //seconds since UTC 00:00:00, 6/1/1980 - 1'000'000'000
  GPSWeek, //seconds of the week + week number since UTC 00:00:00, 6/1/1980 (sunday)
  UTC,
  Count
}

export enum AngleUnit {
  Degree,
  Radian,
  Gradian,
  Count
}

export enum VisualizationMode {
  Default,
  Colour,
  Intensity,
  Classification,
  DisplacementDistance,
  DisplacementDirection,
  GPSTime,
  ScanAngle,
  PointSourceID,
  ReturnNumber,
  NumberOfReturns,
  UserDefinedColourRange,
  AttributeQueryTool,
  Count
}

export enum LensSizes {
  LS_Custom,
  LS_15mm,
  LS_24mm,
  LS_30mm,
  LS_50mm,
  LS_70mm,
  LS_100mm,
  LS_TotalLenses
}

export enum SkyboxType {
  None,
  Colour,
  Simple,
  Atmosphere
}

export enum ScreenshotResolution {
  SR_720p,
  SR_1080p,
  SR_4K,
  SR_Custom,
  Count
}

export enum SettingsPage {
  Appearance,
  Inputs,
  KeyBindings,
  Maps,
  Visualisations,
  Tools,
  Screenshot,
  Connection,
  MissingStrings,
  TranslationTable,
  ReleaseNotes,
  BetaFeatures,
  About,
  Count
}
