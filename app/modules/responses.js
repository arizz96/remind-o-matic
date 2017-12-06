exports.handleAction = function handleAction(action, req) {
  data = {};
  switch(action) {
    case 'error':
    case 'unknown': data = _unknown(req); break;
    case 'no': data = _no(req); break;
    case 'miss_poi': data = _missPoi(req); break;
    case 'miss_place': data = _missPlace(req); break;
    case 'forward': data = _forward(req); break;
    case 'search': data = _search(req); break;
    case 'finish': data = _finish(req); break;
    case 'error_finish': data = _errorFinish(req); break;
  }
  return data;
};

_welcome = function _welcome(req) {
  return {
    action: 'welcome',
    status: 200,
    body:   req.__('welcome')
  };
};

_finish = function _finish(req) {
  return {
    action: 'finish',
    status: 200,
    body:   req.__('finish')
  };
};

_errorFinish = function _errorFinish(req) {
  return {
    action: 'error_finish',
    status: 200,
    body:   req.__('error_finish')
  };
};

_unknown = function _unknown(req) {
  return {
    action: 'unknown',
    status: 200,
    body:   req.__('unknown')
  };
};

_no = function _no(req) {
  return {
    action: 'no',
    status: 200,
    body:   req.__('got_no')
  };
};

_missPoi = function _missPoi(req) {
  return {
    action: 'miss_poi',
    status: 200,
    body:   req.__('miss_poi')
  };
};

_missPlace = function _missPlace(req) {
  return {
    action: 'miss_place',
    status: 200,
    body:   req.__('miss_place')
  };
};

_forward = function _forward(req) {
  return {
    action: 'forward',
    status: 200,
    body:   req.__('forward')
  };
};

_search = function _search(req) {
  return {
    action: 'search',
    status: 200,
    body:   req.__('search')
  };
};
