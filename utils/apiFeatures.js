class APIFeatures {
  constructor(query, queryStr) {
    this.query = query
    this.queryStr = queryStr
  }

  search() {
    if (this.queryStr.keyword) {
      this.query = this.query.find({
        name: {
          $regex: this.queryStr.keyword,
          $options: 'i'
        }
      })
    }
    return this
  }

filter() {
  const queryObj = {};

  for (const key in this.queryStr) {
    // Skip non-filter fields
    if (["keyword", "page", "limit", "sort", "fields"].includes(key)) {
      continue;
    }

    // Handle price[gte], price[lte] etc.
    if (key.includes("[")) {
      const field = key.split("[")[0];
      const operator = key.match(/\[(.*?)\]/)[1]; // extract gte

      if (!queryObj[field]) {
        queryObj[field] = {};
      }

      queryObj[field][`$${operator}`] = Number(this.queryStr[key]);
    } else {
      // Normal fields like category
      queryObj[key] = this.queryStr[key];
    }
  }

  // Make category case-insensitive
  if (queryObj.category) {
    queryObj.category = {
      $regex: queryObj.category,
      $options: "i"
    };
  }

  console.log("FINAL FIXED FILTER 👉", queryObj);

  this.query = this.query.find(queryObj);

  return this;
}


  paginate(resPerPage) {
    const currentPage = Number(this.queryStr.page) || 1
    const skip = resPerPage * (currentPage - 1)

    this.query = this.query.limit(resPerPage).skip(skip)
    return this
  }
}

module.exports = APIFeatures
