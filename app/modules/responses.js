exports.handleAction = function handleAction(action, parameters, req) {
  data = {}
  switch(action) {
    case 'welcome': data =  _welcome(req); break;

    case 'dateTime':
    case 'date':
    case 'time': data = _dateTime(parameters, req); break;
  }

  return data;
};

_welcome = function _welcome(req) {
  return {
    action: 'welcome',
    status: 200,
    body: req.__('welcome')
  }
};

_dateTime = function _dateTime(parameters, req) {
  console.log(parameters.time)
  console.log(parameters.date)

  if(parameters.time && parameters.date)
    body = req.__('got_datetime', { date: parameters.date, time: parameters.time })
  else if(parameters.date)
    body = req.__('got_date', { date: parameters.date })
  else
    body = req.__('got_time', { time: parameters.time })

  return {
    action: 'dateTime',
    status: 200,
    body: body
  }
};