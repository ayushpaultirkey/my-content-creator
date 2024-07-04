export default {
    "config": {
      "url": "https://youtubeanalytics.googleapis.com/v2/reports?ids=channel%3D%3DMINE&startDate=2024-06-04&endDate=2024-07-04&metrics=views%2Clikes%2Cdislikes%2CestimatedMinutesWatched&dimensions=day&sort=day",
      "method": "GET",
      "apiVersion": "",
      "userAgentDirectives": [
        {
          "product": "google-api-nodejs-client",
          "version": "7.2.0",
          "comment": "gzip"
        }
      ],
      "headers": {
        "x-goog-api-client": "gdcl/7.2.0 gl-node/20.12.2",
        "Accept-Encoding": "gzip",
        "User-Agent": "google-api-nodejs-client/7.2.0 (gzip)",
        "Authorization": "Bearer ya29.a0AXooCgvv-jT9YmBj2l4ay8eeZU_exHIYyCxdhaqKHS8hRjDw1QvJxp89HRWNvbDdQsdYOKprhB330VlTVlA8pNN9lpLik0SYgAhdinbScwviM8liNDEwXa88YRxUtdBSfWv0ElWYUoFyATaU8BRCykUxH_XP4SursKeGaCgYKAXwSARISFQHGX2MizsVUt9cOBMKKgYVOOc6jDQ0171"
      },
      "params": {
        "ids": "channel==MINE",
        "startDate": "2024-06-04",
        "endDate": "2024-07-04",
        "metrics": "views,likes,dislikes,estimatedMinutesWatched",
        "dimensions": "day",
        "sort": "day"
      },
      "retry": true,
      "responseType": "unknown"
    },
    "data": { "kind": "youtubeAnalytics#resultTable", "columnHeaders": [{ "name": "day", "columnType": "DIMENSION", "dataType": "STRING" }, { "name": "views", "columnType": "METRIC", "dataType": "INTEGER" }, { "name": "likes", "columnType": "METRIC", "dataType": "INTEGER" }, { "name": "dislikes", "columnType": "METRIC", "dataType": "INTEGER" }, { "name": "estimatedMinutesWatched", "columnType": "METRIC", "dataType": "INTEGER" }], "rows": [["2024-06-01", 66, 2, 0, 42], ["2024-06-02", 109, 4, 1, 216], ["2024-06-03", 84, 3, 0, 34], ["2024-06-04", 72, 3, 0, 86], ["2024-06-05", 104, 3, 0, 90], ["2024-06-06", 134, 11, 0, 177], ["2024-06-07", 71, -1, 0, 76], ["2024-06-08", 85, 2, 0, 42], ["2024-06-09", 82, 1, 0, 110], ["2024-06-10", 142, 8, 0, 122], ["2024-06-11", 162, 10, 0, 265], ["2024-06-12", 91, 2, 0, 111], ["2024-06-13", 110, 5, 0, 195], ["2024-06-14", 102, 7, 0, 75], ["2024-06-15", 70, -3, 0, 103], ["2024-06-16", 169, 6, 0, 291], ["2024-06-17", 221, 25, 0, 393], ["2024-06-18", 128, 3, 0, 173], ["2024-06-19", 133, 4, 0, 103], ["2024-06-20", 157, 0, 0, 265], ["2024-06-21", 98, 7, 0, 244], ["2024-06-22", 101, 0, 0, 112], ["2024-06-23", 126, 8, 0, 199], ["2024-06-24", 130, 6, 0, 112], ["2024-06-25", 141, 7, 1, 327], ["2024-06-26", 218, 8, -1, 239], ["2024-06-27", 133, 11, 0, 186], ["2024-06-28", 104, 3, 0, 149], ["2024-06-29", 118, 4, 0, 125], ["2024-06-30", 108, 10, 0, 166]] },
    "headers": {
      "alt-svc": "h3=\":443\"; ma=2592000,h3-29=\":443\"; ma=2592000",
      "cache-control": "private",
      "content-encoding": "gzip",
      "content-type": "application/json; charset=UTF-8",
      "date": "Thu, 04 Jul 2024 06:25:39 GMT",
      "server": "ESF",
      "transfer-encoding": "chunked",
      "vary": "Origin, X-Origin, Referer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "SAMEORIGIN",
      "x-xss-protection": "0"
    },
    "status": 200,
    "statusText": "OK",
    "request": {
      "responseURL": "https://youtubeanalytics.googleapis.com/v2/reports?ids=channel%3D%3DMINE&startDate=2024-06-04&endDate=2024-07-04&metrics=views%2Clikes%2Cdislikes%2CestimatedMinutesWatched&dimensions=day&sort=day"
    }
  }