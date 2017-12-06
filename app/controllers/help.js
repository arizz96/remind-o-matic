exports.show = function(req, res) {
  res.json({
    action: 'help',
    status: 200,
    body: req.__('help')
  });
}
