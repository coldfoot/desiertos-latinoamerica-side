library(tidyverse)
library(curl)

style <- "cmdq1xmlj00kf01s275sy99eq"
  
#https://api.mapbox.com/styles/v1/{username}/{style_id}/static/{overlay}/{lon},{lat},{zoom},{bearing},{pitch}|{bbox}|{auto}/{width}x{height}{@2x}
  
url <- "https://api.mapbox.com/styles/v1/tiagombp"

url <- paste0(url, '/', style, '/static/')

#[lon(min),lat(min),lon(max),lat(max)]
  
maxx <- -64.780965
maxy <- -25.168313
minx <- -69.095264
miny <- -30.119602

bbox <- paste0("%5B", miny, ",", minx, ",", maxy, ",", maxx, "%5D")

url <- paste0(url, bbox, "/600x600?access_token=pk.eyJ1IjoidGlhZ29tYnAiLCJhIjoiY2thdjJmajYzMHR1YzJ5b2huM2pscjdreCJ9.oT7nAiasQnIMjhUB-VFvmw")

#https://api.mapbox.com/styles/v1/tiagombp/cmdq1xmlj00kf01s275sy99eq/static/-66.947681,-27.335889,4/600x600?access_token=pk.eyJ1IjoidGlhZ29tYnAiLCJhIjoiY2thdjJmajYzMHR1YzJ5b2huM2pscjdreCJ9.oT7nAiasQnIMjhUB-VFvmw

