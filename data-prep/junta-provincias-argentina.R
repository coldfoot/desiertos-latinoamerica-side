library(tidyverse)
library(jsonlite)
library(sf)
library(geojsonsf)

argentina <- st_read("argentina-large-units.geojson")

provincias_buenos_aires <- c("Buenos-Aires-Conurbano__argentina", "Buenos-Aires-Zona-2__argentina", "Buenos-Aires-Zona-3__argentina")

provincias_cordoba <- c("Cordoba-Norte__argentina", "Cordoba-Sur__argentina")

provincias_santa_fe <- c("Santa-Fe-CentroSur__argentina", "Santa-Fe-Norte__argentina")

merge_provincias <- function(keys_to_merge, new_KEY) {
  
  features_to_merge <- argentina[argentina$KEY %in% keys_to_merge, ]
  
  merged_geom <- st_union(features_to_merge)
  merged_geom_s <- st_simplify(merged_geom, dTolerance = 1000)
  
  # Create new feature (with optional attributes)
  merged_feature <- st_sf(KEY = new_KEY, geometry = merged_geom)
  
  argentina <- argentina[!(argentina$KEY %in% keys_to_merge), ]
  
  # Combine
  argentina <- rbind(argentina, merged_feature)
  
}

features_to_merge_bsa <- argentina[argentina$KEY %in% provincias_buenos_aires, ] 
features_to_merge_cor <- argentina[argentina$KEY %in% provincias_cordoba, ] 
features_to_merge_sta <- argentina[argentina$KEY %in% provincias_santa_fe, ] 

# BUENOS AIRES
merged_geom_bsa <-st_union(features_to_merge_bsa)
merged_geom_bsa_s <- st_simplify(merged_geom_bsa, dTolerance = 1000)
merged_feature_bsa <- st_sf(KEY = "Buenos-Aires__argentina", geometry = merged_geom_bsa_s)

# CORDOBA
merged_geom_cor <-st_union(features_to_merge_cor)
merged_geom_cor_s <- st_simplify(merged_geom_cor, dTolerance = 1000)
merged_feature_cor <- st_sf(KEY = "Cordoba__argentina", geometry = merged_geom_cor_s)

# SANTA FE
merged_geom_sta <- st_union(features_to_merge_sta)
#merged_geom_sta_s <- st_simplify(merged_geom_sta, dTolerance = 1000)
merged_feature_sta <- st_sf(KEY = "Santa-Fe__argentina", geometry = merged_geom_sta)

ggplot() +
  geom_sf(data = merged_geom_sta, fill = "transparent") #+
  #geom_sf(data = merged_geom_sta_s, color = "hotpink", fill = "transparent")
  

sf::sf_use_s2(TRUE)


# ggplot() + 
#   #geom_sf(data = features_to_merge) +
#   geom_sf(data = merged_geom, color = "hotpink", fill = "transparent") +
#   geom_sf(data = merged_geom_s, color = "black", fill = "transparent")
#   #geom_sf(data = merged_feature)

argentina <- argentina[!(argentina$KEY %in% provincias_buenos_aires), ]
argentina <- argentina[!(argentina$KEY %in% provincias_cordoba), ]
argentina <- argentina[!(argentina$KEY %in% provincias_santa_fe), ]

# Combine
argentina <- rbind(argentina, merged_feature_bsa, merged_feature_cor, merged_feature_sta)

st_write(argentina, "argentina-large-units-joined.geojson", driver = "GeoJSON")

ggplot(argentina) + geom_sf()

#merge_provincias(provincias_buenos_aires, "Buenos-Aires__argentina")



# bboxes, centroids -------------------------------------------------------

argentina <- st_read("argentina-large-units-joined.geojson")

argentina %>% filter(KEY=="Buenos-Aires__argentina") %>% st_bbox()
argentina %>% filter(KEY=="Buenos-Aires__argentina") %>% st_centroid()

argentina %>% filter(KEY=="Santa-Fe__argentina") %>% st_bbox()
argentina %>% filter(KEY=="Santa-Fe__argentina") %>% st_centroid()
sf::sf_use_s2(TRUE)

argentina %>% filter(KEY=="Cordoba__argentina") %>% st_bbox()
argentina %>% filter(KEY=="Cordoba__argentina") %>% st_centroid()
