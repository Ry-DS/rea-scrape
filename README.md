# step 1:
run scrape.js to grab all pages of property listings from a given search url, gives pagex.json

# step 2:
run enrich_page.js for a page, enriches each property with details about availability and whatnot.
Run it like:
`for i in {2..22}; do node enrich_page.js page${i}.json; done`

# step 3:
do whatever conventional filtering you want with the output jsons

# step 4:
run render_page_md.js to show it in markdown after filtering to a human tractable number.
