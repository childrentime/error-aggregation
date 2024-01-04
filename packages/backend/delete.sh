influx delete \
  --token EPRnDLH7Czp1f7xtOAMcQ0XvSSWGFjrw4ZIqawhGV7gYlg57wmmrRWGOgNHDjQEOigB0XV1owXSs-iXREvSkvA== \
  --org web-errors \
  --bucket errors \
  --start 1970-01-01T00:00:00Z \
  --stop $(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --predicate '_measurement="errors"'
