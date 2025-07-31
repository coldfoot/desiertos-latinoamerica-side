library(tidyverse)

raw_data <- read.csv("small-units.csv")

colnames(raw_data) <- c(
  "country",
  "name",
  "key",
  "pop",
  "area",
  "news_org_count",
  "journalist_count",
  "ratio_pop_news_org",
  "ratio_pop_journalist",
  "ratio_area_journalist",
  "classification"
)


# Desierto ----------------------------------------------------------------

raw_data %>% filter(country == "chile", classification == "DESIERTO") %>% arrange(-pop) %>% head()

raw_data %>% filter(country == "chile") %>% mutate(classification = str_to_upper(classification)) %>% count(classification) %>% mutate(pct = n / nrow(raw_data %>% filter(country == "chile"))) %>% janitor::adorn_pct_formatting()

chile_pop <- raw_data %>% filter(country == "chile") %>% .$pop %>% sum()

chile_pop_desierto <- raw_data %>% filter(country == "chile") %>% mutate(classification = str_to_upper(classification)) %>% filter(classification == "DESIERTO") %>% .$pop %>% sum()

pct_pop_desierto <- 100 * chile_pop_desierto / chile_pop


# Semidesierto ------------------------------------------------------------

raw_data %>% filter(country == "chile", classification == "SEMIDESIERTO") %>% arrange(-pop) %>% head()

raw_data %>% filter(country == "chile") %>% mutate(classification = str_to_upper(classification)) %>% count(classification) %>% mutate(pct = n / nrow(raw_data %>% filter(country == "chile"))) %>% janitor::adorn_pct_formatting()

chile_pop_semidesierto <- raw_data %>% filter(country == "chile") %>% mutate(classification = str_to_upper(classification)) %>% filter(classification == "SEMIDESIERTO") %>% .$pop %>% sum()

pct_pop_semidesierto <- 100 * chile_pop_semidesierto / chile_pop



# semibosque --------------------------------------------------------------

raw_data %>% filter(country == "chile", classification == "SEMIBOSQUE") %>% arrange(-pop) %>% head()

raw_data %>% filter(country == "chile") %>% mutate(classification = str_to_upper(classification)) %>% count(classification) %>% mutate(pct = n / nrow(raw_data %>% filter(country == "chile"))) %>% janitor::adorn_pct_formatting()

chile_pop_semibosque <- raw_data %>% filter(country == "chile") %>% mutate(classification = str_to_upper(classification)) %>% filter(classification == "SEMIBOSQUE") %>% .$pop %>% sum()

pct_pop_semibosque <- 100 * chile_pop_semibosque / chile_pop

# bosque --------------------------------------------------------------

raw_data %>% filter(country == "chile", classification == "BOSQUE") %>% arrange(-pop) %>% head()

raw_data %>% filter(country == "chile") %>% mutate(classification = str_to_upper(classification)) %>% count(classification) %>% mutate(pct = n / nrow(raw_data %>% filter(country == "chile"))) %>% janitor::adorn_pct_formatting()

chile_pop_bosque <- raw_data %>% filter(country == "chile") %>% mutate(classification = str_to_upper(classification)) %>% filter(classification == "BOSQUE") %>% .$pop %>% sum()

pct_pop_bosque <- 100 * chile_pop_bosque / chile_pop
