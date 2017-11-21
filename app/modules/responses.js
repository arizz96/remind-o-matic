exports.handleAction = function handleAction(action, parameters, req) {
  data = {}
  switch(action) {
    case 'welcome': data =  _welcome(req); break;

    case 'dateTime':
    case 'date':
    case 'time': data = _dateTime(parameters, req); break;

    case 'city':
    case 'country':
    case 'region':
    case 'place': data = _place(parameters, req); break;
    case 'unknown': data = _unknown(req); break;
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

_unknown = function _unknown(req) {
  return {
    action: 'unknown',
    status: 200,
    body: req.__('unknown')
  }
};

_dateTime = function _dateTime(parameters, req) {
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

_place = function _place(parameters, req) {
console.log(parameters)
  Object.keys(parameters).forEach(function(key) {
    match = action.replace(/^(geo-)(state).+/, '$2');
    if(match)
      parameters['state'] = parameters[key];
  });
  console.log(parameters)

  if(parameters['geo-city'])
    body = req.__('got_city', { city: parameters['geo-city'] })
  else if(parameters['geo-country'])
    body = req.__('got_country', { country: parameters['geo-country'] })
  else if(parameters.state)
    body = req.__('got_country', { country: parameters.state })
  else if(parameters.place)
    body = req.__('got_place', { place: parameters.place })

  return {
    action: 'place',
    status: 200,
    body: body
  }
}
