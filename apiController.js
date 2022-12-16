const Services = require("./services");

exports.checkStatus = function (req, res, next) {
  res.status(200).send({ message: "API working properly" });
};

exports.Search = function (req, res, next) {
  const {
    query: { q },
  } = req;
  Services.Search(q)
    .then((response) => {
      res.status(response.status).send(response.data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });
};
