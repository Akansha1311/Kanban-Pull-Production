const router = require("express").Router();
const webPush = require("web-push");
const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;

// webPush.setVapidDetails(
//   "mailto: deepanchakravarthi434@gmail.com",
//   publicKey,
//   privateKey
// );

router.post("/:dept", (req, res) => {
  const dept = req.params.dept;
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({ title: dept });
  webPush
    .sendNotification(subscription, payload)
    .catch((err) => console.log(err));
});

module.exports = router;
