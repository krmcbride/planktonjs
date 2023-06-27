export const validAuthJwt =
  'eyJhbGciOiJSUzI1NiJ9.' + // {"alg": "RS256"}
  'eyJuYW1lIjoiSm9lIFNtaXRoIn0.' + // {"name": "Joe Smith"}
  'hjVUeKFzFE6Jla6HFsrlrsk-vmBJ3MnugmSXKqPRVfHoukpqekuJqdDTbtqyM91UZoHHD' +
  '62iiOlIG8eOWJqzuJXhbkKuNm06pDoXtbtzlgtLRQInpYutEvSaMb10bjgH4WU_u28dxH' +
  'wtkMoe-KJDm0C9y__8TaT0y7RH_O3rHPKxzQoTMUHc1f4NJLknr7R-P2KHng1IOdWr7of' +
  'BgF_tsHBAvi4VYnqdcaVAJP-qBw7dhJy4SnszpfwzucByavtv0ULVJJlIo15ydPZDrDIt' +
  'M-UhSRC1L9SnLaWQJOJtPXphU0zZNCCw4kRtER8NMdwnzl5ih0oEWaTCosZLMoOIeNxzQ' +
  'ZCTi8sxiqu7ypkhoFJGeS0FJQ-jGJp_HnhsRd4Dsys9rFQd8EKuxxXjHXxPXn1m480xfW' +
  '0xQUYxDlLwKc7wwSk5IbAsLAxuMwPo-M0Lp_iu-cN0c4BVYyX6CBphtdKnax1BHyTy5ve' +
  'LWwQk4cANp1o-NJLp9Qw3SdsbaZGJuRYJ2XOYfuA99ncuhnwAojiVNk-S9ThHljm4pOSN' +
  '-YUTS4MlzfJq3ZZOzaCGJs_kr6X55bT-gOt5FREEthVIeGcAvMx7Clkr5CUEaLTB2hs69' +
  'jzQuNOrkW7LmoXLJo8Suj8_V0RlnrhO7LW2q6zAzrtaSoRZZs0qLSVz0A8xwR0';

export const validAuthJwt2 =
  'eyJhbGciOiJSUzI1NiJ9.' + // {"alg": "RS256"}
  'eyJ1c2VyX25hbWUiOiJ0ZXN0MUBnbWFpbC5jb20iLCJzY29wZSI6WyJhY2NvdW50Il0sI' +
  'mF1dGhvcml0aWVzIjpbIlJPTEVfQURNSU4iLCJST0xFX0NBTEwiLCJST0xFX1VTRVIiXS' +
  'wianRpIjoiOWQ4ZTg5YTYtODE1MC00NzlhLWFmMTMtNzNkNmE3NThhMDIwIiwiY2xpZW5' +
  '0X2lkIjoiYXV0aCJ9.' + // {"user_name": "test1@gmail.com", "scope": [ "account" ], "authorities": [ "ROLE_ADMIN", "ROLE_CALL", "ROLE_USER" ]}
  'K7PJm8uzHZoqV2d9skNcBiGTg1SoVdsTpPkMEp1nGkjhbCsf24Im_Eq9TgElDX7Yv7S41' +
  'dboL4MDeCjlz2LWAOtFbZY-EHlEbzLU9JYKr89l99wSZkL_bRQU5sGTFy8bTBzyr49_uO' +
  'bOB8to3REbNBmjeFgkisoZOkQU93VETKVTRz_POGpe8HZjC_V55NhZDOvgenDWgwhAnWP' +
  'L8sQOzITjB2qVjzpoE3SAIvwa1acOQf-4_ZHc8dpSC2gKgoPvbYSFe9Ia7r8NCGQ7j5xc' +
  'mFoZxq7VcbYVTl6RGyMBZKObUX0Uw4kb0RYCyh8lyvdIc25e9ZUgY7T5FVN-I7KRgIW_Y' +
  'YDbbtwbi7p3k6csHnSaFGzeoP8-PuBQ35or4Up7X59eoRmxGSzLwoDq3GxHzrwynuek3m' +
  'DNvraWVjRuNiRgVWoqzieR5O2IWLsddPaq7gSMjw2szkbnAGNBpqNJjXTRP2MkD3H2g2I' +
  '9BgaT1SQVeqVNP9qOnRvgb8Go_zC2RpTCfphPHZUfx2bvn_Gcav1JP0Sk86lFQL_TFJrd' +
  'eW_ixk4ddhceTKBjMMHgafXHfio3vTCJ4hKfOcsztY2zaLhAhGnx4DqvoQc_ArhyprWAK' +
  'uRDWz7O8PqCrZoZobYh0a7Vw-kBH3wfSH6d4mTKftXGAWycJM4U44jj4jvmZYI';

export const invalidAlgAuthJwt =
  'eyJhbGciOiJIUzI1NiJ9.' + // {"alg": "HS256"}
  'eyJuYW1lIjoiSm9lIFNtaXRoIn0.' + // {"name": "Joe Smith"}
  'lynIIFv5zJ6mVQzoGp3PzQz5WKxxf7TpRuVimiFn2vYcvdVMaqGsBS4mFaR68jpxyUCyL' +
  'Gt3eNZxA32fYEMCBFXgtkwBeSX4u-ad0x8KEh32cHKLV7XJEhOPxNwmv2et2BLMUGFtuf' +
  '2Wcr3Lz-3w0Uy9czh1KGSmeoik3xDfKQQPi4WNNC-K1aaKS7YRf1bBa1QhJxYLRvtYxDy' +
  'y7lGEovfAN8BdXehUiUyTehCL4bXUeaK9ISKJ-XlHssjJVJRleGCawGrpI2tcWimpe7Vf' +
  'sCdcMBgGTwO7fqY8zBX5FNOuUqzAQ7t9oP3pcu7vC3fQyfsEE-m_E2dEtghgRsBMR7iEd' +
  'XKeG21Fs59EAPcY8F0rcHcd5PMTORmKz0Y7vkf1BAs_SN7YACWXR16gejcvaHzEoM7x4s' +
  'yJh1cDxKk9kHMhiDFV8aq8O-MUB9YLnvBEIyppjV-n6bqQG6jRCGnhDRq7DlAlI4G-hin' +
  'HxHjfeNMYPznpaiYdWHdCHAOv66YhboIXm7Pg4zA65csZH2_cH2fdJDIxVfnyU6yZ1P6Y' +
  'YohSS4J3YuE8hkYjH5P1iY7aUm4i_-9iFXV_mW4CQJ1tjf5wbGhgjiaoCe-isTmNakfiO' +
  'VZHbPxoluhqiNlNVXTIl3v9tGrS6dgnI4ts_xiACcYOvuwLGIbWE4-p3Do64tA';

export const expiredAuthJwt =
  'eyJhbGciOiJSUzI1NiJ9.' + // {"alg": "RS256"}
  'eyJleHAiOjE0NDA1MjgyOTEsIm5hbWUiOiJKb2UgU21pdGgifQ.' + // {"name": "Joe Smith", "exp": 1440528291}
  'Mmzt3QL69l8bT9XbySn-ZfSzoFLT0SatqjfyynLculsjRVIaauF5fYYEzyoEjUR87Ha3P' +
  'uL_PaEij5UqaUtOrpU1z_T_DEMk6NxUJLc7KBKcwqnIts5caCsApIBtWEIelVMP09oZSo' +
  'PUuToqS8o-lVJ0jil08q5MKZo0capBHBvf9AJf9wi8xfwN7rU3P-UDPhD77nM-cbBGjCi' +
  'KZMHEmyvo6LYkVKi_IxPy7FcNp9eBCyNoJO_X9O6ZOyY8126UWuPZnmhVNXzuVpvdVsjJ' +
  'EugITYJA4d147CgGumrc0AoBMyB8Blklyqg98tVcpS8TGeLHGMHXV4Ggq-FC2PhAVrxGD' +
  'Npjf2Y65Pkc0EYm0Jp86UnJF4qj6_ktCSW0kE4pEkstKHrGusMl4U3E4IOcV3ZUSz_oRh' +
  '27UwR_Fy0xplnR7TH7030s9XmTfcwyWK8xvXjxcaux3GJSMp2WT2UxfPy_x1k2iSNrICv' +
  'tG5qFWt-esuHYMZ-MnHuPc1ER_ufbKL0Qdc5BAqIq9f1j3YIeUF960XEpPlwSvK0DPktz' +
  '-ev2oSnVS0ON3yM3uzolQkCSxPCh1YEAnjlgR9ihyQl4VD7PYq9MHTRF8AfUybCs-FVZp' +
  'FHRnBSMNDN-Yve6kwpZlZTS_z0jJURd2VgyKXwrQfu5-bAI-BRmr7BDK-gwdxM';

/*

 Test JWTs created at http://jwt.io/ using the following keys

 -----BEGIN PUBLIC KEY-----
 MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAukJVqlSotgLZMkNvVtva
 OomXIO+QvYsc0A6vkDIoaXTmQH8nmUyOjMcAXdar/K7mMEGheMXugcxYeADopSL4
 tk5AY/XLJs35G0Ku67DGCLJPAGt8ua6ndVqUXciZ/JmRWxEDVaAljlBlbVu4kKF8
 YO5iXLSKIX1o156dV76vv3nWQw1JvDob6raoGgUiqdEKrDoWKlM1clYx3bz7oYnT
 djidG6yqOU9MSzkpy7cJ4SSVwMHZDYojovDxsecASecQcLK9nhzSkQhhfiNjafCb
 5+T76Fsw8q4kiv3r6G+zP4Zp/u9Es5YIY+6LBzyUYVihsnL9PujL5T/+O5VSqE0i
 iN5sI9x66OFEjG7FmuMNZHLtMklf8FWHrnIMo5PDmf0+F0IlmsGnWFv7QFFfTXIF
 8TpsFh0aJx7MwLkt1mhOtU8LZoUla4YF+U7iNqt+Pad61snKFIydGZw5trih4Yby
 olRxiMl/MFTj8xUjBMjFOGBISa1wpCxbiOBdHfjuV4pJ+iIQw0CAbZ63+SWgDEXf
 Yfj6REMTrY5mbOHHV6cNp6nQ+LVll9+DXp9HIcRL885UmLabXRcODSJkFZGwbH4P
 RrkaTpQRqxqD+jkpxrPZ2vaejyqkQ2wUheHP/fKw4KjD6Yds3v9OMm5KYB5WK+NG
 JTdD8XgAZhtPgpn79UChzlcCAwEAAQ==
 -----END PUBLIC KEY-----

 -----BEGIN RSA PRIVATE KEY-----
 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
 -----END RSA PRIVATE KEY-----

 */
