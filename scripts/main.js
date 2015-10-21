requirejs.config({
  paths: {
    'jquery': '../bower_components/jquery/dist/jquery',
    'bootstrap': '../bower_components/bootstrap/dist/js/bootstrap'
  },
  shim: {
    'bootstrap': ['jquery']
  }
});