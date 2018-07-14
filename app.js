var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
var readline = require('readline');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/csv.json',function(req,res){
  res.header('Content-Type', 'application/json')
  res.json(result);
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var rd = readline.createInterface({
  input: fs.createReadStream('./KAKAO_BIZ_TYPE.csv'),
  //output: process.stdout,
  console: false
});
var result = {
  "BG":{},
  "MI":{},
  "SL":{}
};
var count = 0;
rd.on('line', function(line) {
  //console.log(line);
    if(count > 1){
    var templine = line.split(',');
    if(templine[2] != '' && typeof result.BG[templine[2]] == "undefined") {
      result.BG[templine[2]] = {
        "INDEX": templine[0],
        "ZCD": templine[2],
        "NM": templine[6].replace(/\^/gi,',')
      };
      if(typeof result.MI[templine[2]] == "undefined"){
        result.MI[templine[2]] = {};
      }
      if(typeof result.SL[templine[2]] == "undefined"){
        result.SL[templine[2]] = {};
      }
    }
    if(templine[3] != '' && typeof result.MI[templine[2]][templine[3]] == "undefined") {
      result.MI[templine[2]][templine[3]] = {
        "INDEX": templine[0],
        "ZCD": templine[3],
        "NM": templine[7].replace(/\^/gi,',')
      };
      if(typeof result.SL[templine[2]][templine[3]] == "undefined"){
        result.SL[templine[2]][templine[3]] = {};
      }
    }
    if(templine[4] != '' && typeof result.SL[templine[2]][templine[3]][templine[4]] == "undefined") {
      result.SL[templine[2]][templine[3]][templine[4]] = {
        "INDEX": templine[0],
        "ZCD": templine[4],
        "NM": templine[8].replace(/\^/gi,',')
      };
    }
  }
  if(count == 2590) {
    result.BG = Object.keys(result.BG).map(function(d){
      return result.BG[d];
    }).sort(function(a,b){
      return parseInt(a.INDEX) - parseInt(b.INDEX) ;
    });
    Object.keys(result.MI).map(function(d,i){
      if(Object.keys(result.MI[d]).length > 0){
        var temp2 = [];
        temp2 = Object.keys(result.MI[d]).map(function(d1){
          return result.MI[d][d1];
        });
        temp2.push({"INDEX":"0","ZCD":"0","NM":"해당없음"});
        result.MI[d] = temp2.sort(function(a,b){
          return parseInt(a.INDEX) - parseInt(b.INDEX) ;
        });
      }
      else {
        result.MI[d] = [{"INDEX":"0","ZCD":"0","NM":"해당없음"}];
      }
    });
    Object.keys(result.SL).map(function(d){
      if(Object.keys(result.SL[d]).length > 0){
        Object.keys(result.SL[d]).map(function(d1){
          if(Object.keys(result.SL[d][d1]).length > 0){
            var temp3 = [];
            temp3 = Object.keys(result.SL[d][d1]).map(function(d2){
              return result.SL[d][d1][d2];
            });
            temp3.push({"INDEX":"0","ZCD":"0","NM":"해당없음"});
            result.SL[d][d1] = temp3.sort(function(a,b){
              return parseInt(a.INDEX) - parseInt(b.INDEX) ;
            });
          }
          else {
            result.SL[d][d1] = [{"INDEX":"0","ZCD":"0","NM":"해당없음"}];
          }
        });
      }
      else {
        result.SL[d] = [{"INDEX":"0","ZCD":"0","NM":"해당없음"}];
      }
    });
    console.log(result);
  }

  count++;
});

module.exports = app;
