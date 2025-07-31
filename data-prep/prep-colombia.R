library(tidyverse)
library(sf)
library(geojsonsf)
library(jsonlite)
library(geojsonio)

colombia <- st_read("colombia-small-units.geojson")
col_centers <- st_centroid(colombia) %>% filter(CLASSIFICATION != "SIN DATOS")

ggplot() + geom_sf(data = colombia) + geom_sf(data = col_centers)

st_write(col_centers, "colombia-centroids.geojson", driver = "GeoJSON")

st_bbox(colombia)
