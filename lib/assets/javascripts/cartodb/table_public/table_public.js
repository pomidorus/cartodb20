/**
 *  entry point for table
 */


$(function() {


  var TablePublic = cdb.core.View.extend({

    el: document.body,

    events: {
      'keypress': 'keyPress',
      'keyup': 'keyUp'
    },

    initialize: function() {
      this.user = new cdb.admin.User(this.options.user_data);

      this._initModels();
      this._initViews();

      // init data
      var sql = 'select * from ' + this.table.get('name');
      this.sqlView.setSQL(sql);
      this.table.useSQLView(this.sqlView);
      this.map.layers.reset(this.options.layers, {parse: true});
    },

    _initModels: function() {
      var self = this;
      this.table = new cdb.admin.CartoDBTableMetadata({
        id: this.options.table_id,
        name: this.options.table_name
      });
      this.columns = this.table.data();
      this.map = new cdb.admin.Map(this.options.map);
      this.infowindow = new cdb.geo.ui.InfowindowModel({ });
      this.sqlView = new cdb.admin.SQLViewDataAPI();

      // fetch or create map id
      this.map.relatedTo(this.table);

      this.map.bind('change:dataLayer', _.once(function() {
        self.dataLayer = self.map.get('dataLayer');

        self.table.bind('change:dataSource', function() {
          var sql = null;//'select * from ' + this.get('name');
          if(this.isInSQLView()) {
            sql = this.data().getSQL();
          }
          self.dataLayer.set({
              query: sql
          });
        });

        var query = self.dataLayer.get('query');
        if(query ) {
          self.sqlView.setSQL(query);
          self.table.useSQLView(self.sqlView);
        }

        var infowindowData = self.dataLayer.get('infowindow');
        if(infowindowData) {
          self.infowindow.set(infowindowData);
        }

      }));

    },

    _initViews: function() {
      var self = this;

      this.tabs = new cdb.admin.Tabs({
        el: this.$('nav')
      });
      this.addView(this.tabs);

      this.workView = new cdb.ui.common.TabPane({
        el: this.$('.panes')
      });

      this.addView(this.workView);

      this.tableTab = new cdb.admin.TableTab({
        model: this.table
      });

      this.mapTab = new cdb.admin.MapTabPublic({
        model: this.map,
        table: this.table,
        infowindow: this.infowindow
      });

      this.globalError = new cdb.admin.GlobalError({
        el: $('.globalerror')
      });
      this.table.bind('notice', this.globalError.showError, this.globalError);
      this.addView(this.globalError);

      this.map.bind('change:dataLayer', _.once(function() {

        self.table.bind('change:name', function() {
          self.dataLayer.set({ table_name: self.table.get('name') });
        });

        self.dataLayer.set({
          table_name: self.table.get('name'),
          user_name: self.user.get("username")
        });

        // set api key when we have api key and the data layer loaded
        var sql = self.table.isInSQLView() ?
                      self.table.data().getSQL() :
                      undefined;

        self.dataLayer.set({
          sql: sql,
          extra_params: {
            map_key: self.user.get('api_key')
          }
        });

      }));

      this.workView.addTab('table', this.tableTab.render());
      this.workView.addTab('map', this.mapTab.render());
      this.workView.bind('tabEnabled:map', this.mapTab.enableMap, this.mapTab);

      this.workView.bind('tabEnabled', this.tabs.activate);
      this.workView.active('table');

      // global click
      enableClickOut(this.$el);

      // On resize window...
      $(window).bind("resize", this._onResize);

    },

    // Close all dialogs in window resize
    _onResize: function(e) {
      cdb.god.trigger("closeDialogs");
    },

    keyUp: function(e) {
    },

    keyPress: function(e) {
      /*if(e.which == 19) {
        this.menu.show();
        this.menu.active('sql_mod');
        e.preventDefault();
        return false;
      }*/
    }

  });

    var TableRouter = Backbone.Router.extend({

        initialize: function(table) {
          var self = this;
          this.table = table;
          this.table.table.bind('change:dataSource', function() {
            if(this.isInSQLView()) {
              var sql = this.data().getSQL();
              if(!this.alterTableData(sql)) {
                self.navigate('table/' + encodeURIComponent(sql));
              }
            } else {
              self.navigate('table');
            }
          });
        },

        routes: {
            '': 'index',
            'table': 'index',
            'table/:sql': 'table_sql',
            'map': 'map'
        },

        index: function() {
          this.table.workView.active('table');
        },

        table_sql: function(sql) {
          this.index();
          if(!this.table.table.alterTableData(sql)) {
            this.table.sqlView.setSQL(decodeURIComponent(sql));
            this.table.table.useSQLView(this.table.sqlView);
          }
        },

        map: function() {
          this.table.workView.active('map');
        }

    });


    cdb.init(function() {
      cdb.config.set({
        tiler_port: '8181',
        tiler_domain: 'localhost.lan'
      });
      cdb.config.set({
        sql_api_domain: 'development.localhost.lan',
        sql_api_endpoint: '/api/v1/sql',
        sql_api_port: 8080
      });
      cdb.templates.namespace = 'cartodb/';

      _.each(layers, function(lyr) {
        lyr.options = JSON.parse(lyr.options);
      });

      var table = new TablePublic({
        table_id: table_id,
        table_name: table_name,
        user_data: user_data,
        map: map,
        layers: layers
      });
      var router = new TableRouter(table);
      // expose to debug
      window.table = table;
      Backbone.history.start();
    });

});