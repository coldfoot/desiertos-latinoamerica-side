library(tidyverse)
library(sf)
library(geojsonsf)
library(jsonlite)

shapefile_path <- "./data-prep/ne_50m_admin_0_countries/ne_50m_admin_0_countries.shp"
data<- st_read(shapefile_path)

countries <- data %>% 
  select(country_name = SOVEREIGNT) %>% 
  filter(country_name %in% c("Chile", "Colombia", "Mexico", "Argentina", "Peru"))

ggplot(countries) + geom_sf()

#write(sf_geojson(countries), "data.json")

sf::st_bbox(countries)

bbox <- sf::st_bbox(countries %>% filter(country_name == "Peru")) 
paste0("[", paste(bbox, collapse = ", "), "]")

