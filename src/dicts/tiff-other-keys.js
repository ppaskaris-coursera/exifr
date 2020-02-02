import {tagKeys} from '../tags.js'


// all other uncathegorized or SubIFD tags from:
// http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/EXIF.html
// https://metacpan.org/pod/distribution/Image-ExifTool/lib/Image/ExifTool/TagNames.pod#EXIF-Tags

// Additional and barely used, but known tags in IFD0
let extendedIfd0 = [
	[0x8480, 'IntergraphMatrix'],
	[0x8482, 'ModelTiePoint'],
	[0x8546, 'SEMInfo'],
	[0x87af, 'GeoTiffDirectory'],
	[0x87b0, 'GeoTiffDoubleParams'],
	[0x87b1, 'GeoTiffAsciiParams'],
	[0xc4a5, 'PrintIM'],
	[0xc621, 'ColorMatrix1'],
	[0xc622, 'ColorMatrix2'],
	[0xc623, 'CameraCalibration1'],
	[0xc624, 'CameraCalibration2'],
	[0xc625, 'ReductionMatrix1'],
	[0xc626, 'ReductionMatrix2'],
	[0xc627, 'AnalogBalance'],
	[0xc628, 'AsShotNeutral'],
	[0xc629, 'AsShotWhiteXY'],
	[0xc62a, 'BaselineExposure'],
	[0xc62b, 'BaselineNoise'],
	[0xc62c, 'BaselineSharpness'],
	[0xc62e, 'LinearResponseLimit'],
	[0xc62f, 'CameraSerialNumber'],
	[0xc635, 'MakerNoteSafety'],
	[0xc65a, 'CalibrationIlluminant1'],
	[0xc65b, 'CalibrationIlluminant2'],
	[0xc65d, 'RawDataUniqueID'],
	[0xc68b, 'OriginalRawFileName'],
	[0xc68c, 'OriginalRawFileData'],
	[0xc68f, 'AsShotICCProfile'],
	[0xc690, 'AsShotPreProfileMatrix'],
	[0xc691, 'CurrentICCProfile'],
	[0xc692, 'CurrentPreProfileMatrix'],
	[0xc6bf, 'ColorimetricReference'],
	[0xc6c5, 'SRawType'],
	[0xc6d2, 'PanasonicTitle'],
	[0xc6d3, 'PanasonicTitle2'],
	[0xc6f3, 'CameraCalibrationSig'],
	[0xc6f4, 'ProfileCalibrationSig'],
	[0xc6f5, 'ProfileIFD'],
	[0xc6f6, 'AsShotProfileName'],
	[0xc6f8, 'ProfileName'],
	[0xc6f9, 'ProfileHueSatMapDims'],
	[0xc6fa, 'ProfileHueSatMapData1'],
	[0xc6fb, 'ProfileHueSatMapData2'],
	[0xc6fc, 'ProfileToneCurve'],
	[0xc6fd, 'ProfileEmbedPolicy'],
	[0xc6fe, 'ProfileCopyright'],
	[0xc714, 'ForwardMatrix1'],
	[0xc715, 'ForwardMatrix2'],
	[0xc716, 'PreviewApplicationName'],
	[0xc717, 'PreviewApplicationVersion'],
	[0xc718, 'PreviewSettingsName'],
	[0xc719, 'PreviewSettingsDigest'],
	[0xc71a, 'PreviewColorSpace'],
	[0xc71b, 'PreviewDateTime'],
	[0xc71c, 'RawImageDigest'],
	[0xc71d, 'OriginalRawFileDigest'],
	[0xc725, 'ProfileLookTableDims'],
	[0xc726, 'ProfileLookTableData'],
	[0xc763, 'TimeCodes'],
	[0xc764, 'FrameRate'],
	[0xc772, 'TStop'],
	[0xc789, 'ReelName'],
	[0xc791, 'OriginalDefaultFinalSize'],
	[0xc792, 'OriginalBestQualitySize'],
	[0xc793, 'OriginalDefaultCropSize'],
	[0xc7a1, 'CameraLabel'],
	[0xc7a3, 'ProfileHueSatMapEncoding'],
	[0xc7a4, 'ProfileLookTableEncoding'],
	[0xc7a5, 'BaselineExposureOffset'],
	[0xc7a6, 'DefaultBlackRender'],
	[0xc7a7, 'NewRawImageDigest'],
	[0xc7a8, 'RawToPreviewGain'],
]

let otherTiffTags = [
	[0x0111, 'StripOffsets'],
	[0x0117, 'StripByteCounts'],
	[0x0120, 'FreeOffsets'],
	[0x0121, 'FreeByteCounts'],
	[0x0123, 'GrayResponseCurve'],
	[0x0124, 'T4Options'],
	[0x0125, 'T6Options'],
	[0x012c, 'ColorResponseUnit'],
	[0x0140, 'ColorMap'],
	[0x0144, 'TileOffsets'],
	[0x0145, 'TileByteCounts'],
	[0x0146, 'BadFaxLines'],
	[0x0147, 'CleanFaxData'],
	[0x0148, 'ConsecutiveBadFaxLines'],
	[0x014a, 'SubIFD'],
	[0x014d, 'InkNames'],
	[0x014e, 'NumberofInks'],
	[0x0150, 'DotRange'],
	[0x0152, 'ExtraSamples'],
	[0x0153, 'SampleFormat'],
	[0x0154, 'SMinSampleValue'],
	[0x0155, 'SMaxSampleValue'],
	[0x0156, 'TransferRange'],
	[0x0157, 'ClipPath'],
	[0x0158, 'XClipPathUnits'],
	[0x0159, 'YClipPathUnits'],
	[0x015a, 'Indexed'],
	[0x015b, 'JPEGTables'],
	[0x015f, 'OPIProxy'],
	[0x0190, 'GlobalParametersIFD'],
	[0x0191, 'ProfileType'],
	[0x0192, 'FaxProfile'],
	[0x0193, 'CodingMethods'],
	[0x0194, 'VersionYear'],
	[0x0195, 'ModeNumber'],
	[0x01b1, 'Decode'],
	[0x01b2, 'DefaultImageColor'],
	[0x01b3, 'T82Options'],
	[0x01b5, 'JPEGTables'],
	[0x0200, 'JPEGProc'],
	[0x0203, 'JPEGRestartInterval'],
	[0x0205, 'JPEGLosslessPredictors'],
	[0x0206, 'JPEGPointTransforms'],
	[0x0207, 'JPEGQTables'],
	[0x0208, 'JPEGDCTables'],
	[0x0209, 'JPEGACTables'],
	[0x022f, 'StripRowCounts'],
	[0x03e7, 'USPTOMiscellaneous'],
	[0x4747, 'XP_DIP_XML'],
	[0x4748, 'StitchInfo'],
	[0x7000, 'SonyRawFileType'],
	[0x7010, 'SonyToneCurve'],
	[0x7031, 'VignettingCorrection'],
	[0x7032, 'VignettingCorrParams'],
	[0x7034, 'ChromaticAberrationCorrection'],
	[0x7035, 'ChromaticAberrationCorrParams'],
	[0x7036, 'DistortionCorrection'],
	[0x7037, 'DistortionCorrParams'],
	[0x74c7, 'SonyCropTopLeft'],
	[0x74c8, 'SonyCropSize'],
	[0x800d, 'ImageID'],
	[0x80a3, 'WangTag1'],
	[0x80a4, 'WangAnnotation'],
	[0x80a5, 'WangTag3'],
	[0x80a6, 'WangTag4'],
	[0x80b9, 'ImageReferencePoints'],
	[0x80ba, 'RegionXformTackPoint'],
	[0x80bb, 'WarpQuadrilateral'],
	[0x80bc, 'AffineTransformMat'],
	[0x80e3, 'Matteing'],
	[0x80e4, 'DataType'],
	[0x80e5, 'ImageDepth'],
	[0x80e6, 'TileDepth'],
	[0x8214, 'ImageFullWidth'],
	[0x8215, 'ImageFullHeight'],
	[0x8216, 'TextureFormat'],
	[0x8217, 'WrapModes'],
	[0x8218, 'FovCot'],
	[0x8219, 'MatrixWorldToScreen'],
	[0x821a, 'MatrixWorldToCamera'],
	[0x827d, 'Model2'],
	[0x828d, 'CFARepeatPatternDim'],
	[0x828e, 'CFAPattern2'],
	[0x828f, 'BatteryLevel'],
	[0x8290, 'KodakIFD'],
	[0x82a5, 'MDFileTag'],
	[0x82a6, 'MDScalePixel'],
	[0x82a7, 'MDColorTable'],
	[0x82a8, 'MDLabName'],
	[0x82a9, 'MDSampleInfo'],
	[0x82aa, 'MDPrepDate'],
	[0x82ab, 'MDPrepTime'],
	[0x82ac, 'MDFileUnits'],
	[0x8335, 'AdventScale'],
	[0x8336, 'AdventRevision'],
	[0x835c, 'UIC1Tag'],
	[0x835d, 'UIC2Tag'],
	[0x835e, 'UIC3Tag'],
	[0x835f, 'UIC4Tag'],
	[0x847e, 'IntergraphPacketData'],
	[0x847f, 'IntergraphFlagRegisters'],
	[0x8481, 'INGRReserved'],
	[0x84e0, 'Site'],
	[0x84e1, 'ColorSequence'],
	[0x84e2, 'IT8Header'],
	[0x84e3, 'RasterPadding'],
	[0x84e4, 'BitsPerRunLength'],
	[0x84e5, 'BitsPerExtendedRunLength'],
	[0x84e6, 'ColorTable'],
	[0x84e7, 'ImageColorIndicator'],
	[0x84e8, 'BackgroundColorIndicator'],
	[0x84e9, 'ImageColorValue'],
	[0x84ea, 'BackgroundColorValue'],
	[0x84eb, 'PixelIntensityRange'],
	[0x84ec, 'TransparencyIndicator'],
	[0x84ed, 'ColorCharacterization'],
	[0x84ee, 'HCUsage'],
	[0x84ef, 'TrapIndicator'],
	[0x84f0, 'CMYKEquivalent'],
	[0x8568, 'AFCP_IPTC'],
	[0x85b8, 'PixelMagicJBIGOptions'],
	[0x85d7, 'JPLCartoIFD'],
	[0x8602, 'WB_GRGBLevels'],
	[0x8606, 'LeafData'],
	[0x877f, 'TIFF_FXExtensions'],
	[0x8780, 'MultiProfiles'],
	[0x8781, 'SharedData'],
	[0x8782, 'T88Options'],
	[0x87ac, 'ImageLayer'],
	[0x87be, 'JBIGOptions'],
	[0x8828, 'Opto-ElectricConvFactor'],
	[0x8829, 'Interlace'],
	[0x885c, 'FaxRecvParams'],
	[0x885d, 'FaxSubAddress'],
	[0x885e, 'FaxRecvTime'],
	[0x8871, 'FedexEDR'],
	[0x888a, 'LeafSubIFD'],
	[0x920b, 'FlashEnergy'],
	[0x920c, 'SpatialFrequencyResponse'],
	[0x920d, 'Noise'],
	[0x920e, 'FocalPlaneXResolution'],
	[0x920f, 'FocalPlaneYResolution'],
	[0x9210, 'FocalPlaneResolutionUnit'],
	[0x9215, 'ExposureIndex'],
	[0x9216, 'TIFF-EPStandardID'],
	[0x9217, 'SensingMethod'],
	[0x923a, 'CIP3DataFile'],
	[0x923b, 'CIP3Sheet'],
	[0x923c, 'CIP3Side'],
	[0x923f, 'StoNits'],
	[0x932f, 'MSDocumentText'],
	[0x9330, 'MSPropertySetStorage'],
	[0x9331, 'MSDocumentTextPosition'],
	[0x935c, 'ImageSourceData'],
	[0xa005, 'InteropIFD'],
	[0xa010, 'SamsungRawPointersOffset'],
	[0xa011, 'SamsungRawPointersLength'],
	[0xa101, 'SamsungRawByteOrder'],
	[0xa102, 'SamsungRawUnknown'],
	[0xa20c, 'SpatialFrequencyResponse'],
	[0xa20d, 'Noise'],
	[0xa211, 'ImageNumber'],
	[0xa212, 'SecurityClassification'],
	[0xa213, 'ImageHistory'],
	[0xa216, 'TIFF-EPStandardID'],
	[0xa40b, 'DeviceSettingDescription'],
	[0xa480, 'GDALMetadata'],
	[0xa481, 'GDALNoData'],
	[0xafc0, 'ExpandSoftware'],
	[0xafc1, 'ExpandLens'],
	[0xafc2, 'ExpandFilm'],
	[0xafc3, 'ExpandFilterLens'],
	[0xafc4, 'ExpandScanner'],
	[0xafc5, 'ExpandFlashLamp'],
	[0xb4c3, 'HasselbladRawImage'],
	[0xbc01, 'PixelFormat'],
	[0xbc02, 'Transformation'],
	[0xbc03, 'Uncompressed'],
	[0xbc04, 'ImageType'],
	[0xbc80, 'ImageWidth'],
	[0xbc81, 'ImageHeight'],
	[0xbc82, 'WidthResolution'],
	[0xbc83, 'HeightResolution'],
	[0xbcc0, 'ImageOffset'],
	[0xbcc1, 'ImageByteCount'],
	[0xbcc2, 'AlphaOffset'],
	[0xbcc3, 'AlphaByteCount'],
	[0xbcc4, 'ImageDataDiscard'],
	[0xbcc5, 'AlphaDataDiscard'],
	[0xc427, 'OceScanjobDesc'],
	[0xc428, 'OceApplicationSelector'],
	[0xc429, 'OceIDNumber'],
	[0xc42a, 'OceImageLogic'],
	[0xc44f, 'Annotations'],
	[0xc51b, 'HasselbladExif'],
	[0xc573, 'OriginalFileName'],
	[0xc580, 'USPTOOriginalContentType'],
	[0xc5e0, 'CR2CFAPattern'],
	[0xc616, 'CFAPlaneColor'],
	[0xc617, 'CFALayout'],
	[0xc618, 'LinearizationTable'],
	[0xc619, 'BlackLevelRepeatDim'],
	[0xc61a, 'BlackLevel'],
	[0xc61b, 'BlackLevelDeltaH'],
	[0xc61c, 'BlackLevelDeltaV'],
	[0xc61d, 'WhiteLevel'],
	[0xc61e, 'DefaultScale'],
	[0xc61f, 'DefaultCropOrigin'],
	[0xc620, 'DefaultCropSize'],
	[0xc62d, 'BayerGreenSplit'],
	[0xc631, 'ChromaBlurRadius'],
	[0xc632, 'AntiAliasStrength'],
	[0xc640, 'RawImageSegmentation'],
	[0xc65c, 'BestQualityScale'],
	[0xc660, 'AliasLayerMetadata'],
	[0xc68d, 'ActiveArea'],
	[0xc68e, 'MaskedAreas'],
	[0xc6f7, 'NoiseReductionApplied'],
	[0xc71e, 'SubTileBlockSize'],
	[0xc71f, 'RowInterleaveFactor'],
	[0xc740, 'OpcodeList1'],
	[0xc741, 'OpcodeList2'],
	[0xc74e, 'OpcodeList3'],
	[0xc761, 'NoiseProfile'],
	[0xc7aa, 'CacheVersion'],
	[0xc7b5, 'DefaultUserCrop'],
	[0xc7d5, 'NikonNEFInfo'],
	[0xfe00, 'KdcIFD'],
]

extend('ifd0', extendedIfd0)
extend('ifd0', otherTiffTags)
extend('exif', otherTiffTags)

function extend(blockName, newTags) {
	let map = tagKeys.get(blockName)
	let entry
	for (entry of newTags) map.set(entry[0], entry[1])
}