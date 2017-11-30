exports.handleAction = function handleAction(action, parameters, req) {
  data = {}
  switch(action) {
    // case 'welcome': data =  _welcome(req); break;

    case 'dateTime':
    case 'date':
    case 'time': data = _dateTime(parameters, req); break;

    case 'city':
    case 'country':
    case 'region':
    case 'poiPlace':
    case 'place': data = _place(parameters, req); break;
    case 'unknown': data = _unknown(req); break;
    case 'no': data = _no(req); break;
    case 'miss_poi': data = _missPoi(req); break;
    case 'miss_place': data = _missPlace(req); break;
    case 'forward': data = _forward(parameters, req); break;
    case 'search': data = _search(req); break;

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

_no = function _no(req) {
  return {
    action: 'no',
    status: 200,
    body: req.__('got_no')
  }
};

_missPoi = function _missPoi(req) {
  return {
    action: 'miss_poi',
    status: 200,
    body: req.__('miss_poi')
  }
};

_missPlace = function _missPlace(req) {
  return {
    action: 'miss_place',
    status: 200,
    body: req.__('miss_place')
  }
};

_forward = function _forward(parameters, req) {
  return {
    action: 'forward',
    status: 200,
    body: req.__('forward', {name: parameters})
  }
};

_search = function _search(req) {
  return {
    action: 'search',
    status: 200,
    body: 'Ecco i posti che abbiamo trovato. È uno di questi?'
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
  if(parameters.geo_place)
    body = req.__('got_place', { place: parameters.geo_place })
  else if(parameters.geo_poi)
    body = req.__('got_poi', { poi: parameters.geo_poi })

  return {
    action: 'place',
    status: 200,
    body: body
  }
}
