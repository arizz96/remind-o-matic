exports.finish = function(req, res) {
  res.json({
    action: 'finish',
    status: 200,
    body: req.__('finish')
  });
}
