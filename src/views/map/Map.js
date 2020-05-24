import {Feature, Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import Select from 'ol/interaction/Select';
import TileWMS from 'ol/source/TileWMS'
import {Circle as CircleStyle, Fill, Stroke, Style, Icon} from 'ol/style';
import {Draw, Modify, Snap} from 'ol/interaction';
import {defaults as defaultControls, ScaleLine, FullScreen, OverviewMap} from 'ol/control';
import Overlay from 'ol/Overlay';
import {toStringHDMS} from 'ol/coordinate.js';
import {fromLonLat, toLonLat} from 'ol/proj.js';
import WMSGetFeatureInfo from 'ol/format/WMSGetFeatureInfo';
import OSM from 'ol/source/OSM'
import axios from 'axios';
var json = require('../../assets/json/styles.json');
import draggable from 'vuedraggable'
import Vue from "vue";

let scaleLineControl = new ScaleLine();
scaleLineControl.setUnits('metric');
let styleForSelected = new Style({
  stroke: new Stroke({
    color: 'white',
    width: 1,
  }),
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.5)'
  })
})

const singleClick = new Select({
  style: styleForSelected,
});
let source = new VectorSource();
let modify = new Modify({
  features: singleClick.getFeatures(),
});
let reservedStyles = ['rgba(0, 150, 0, 0.5)', 'rgba(150, 0, 0, 0.5)', 'rgba(255, 255, 0, 0.5)', 'rgba(0, 0, 150, 0.5)', 'rgba(150, 0, 150, 0.5)', 'rgba(0, 150, 150, 0.5)']

let vector = new VectorLayer({
  source: source,
});
let aero = new TileLayer({
  source: new XYZ({
    url: `https://{1-4}.aerial.maps.cit.api.here.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png?app_id=bC3EwJd5PpBZQksByia9&app_code=ZgXJboW6NT-PllF8etor9g`
  })
});
let osm = new TileLayer({
  source: new OSM()
});

export default {
  components: {
    draggable,
  },
  name: 'map',
  computed: {
    myList: {
      get() {
        return this.layerStyles
      },
      set(value) {
        this.upd(value)
        this.layerStyles = value;
      }
    }
  },
  data: () => ({
      filter_option: null,
      filter_value: null,
      menuVisible: false,
      styles: json,
      selectedFilters: {},
      array: [],
      orderIds: [],
      picsArr: [],
      lastSelectedFeature: {},
      changingLayerId: null,
      selectedLayer: {styles: []},
      selectedIds: [],
      selectedStyles: [],
      selected: [],
      search: null,
      searched: [],
      pointsAdding: false,
      showDialog: false,
      layersIds: [],
      layers: [],
      layerNames: [],
      layerFeatures: [],
      layerStyles: [],
      url: 'http://nuolh.belstu.by:4201',
      noConn: false,
      loading: false,
      photosDialog: false
    }
  ),
  date: {
    map: null,
    draw: null,
    snap: null,
  },
  props: {
    msg: String,
  },
  mounted: function () {
    var swipe = document.getElementById('myRange');
    aero.on('precompose', function (event) {
      var ctx = event.context;
      var width = ctx.canvas.width * (swipe.value / 100);
      ctx.save();
      ctx.beginPath();
      ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
      ctx.clip();
    });
    aero.on('postcompose', function (event) {
      const ctx = event.context;
      ctx.restore();
    });
    swipe.addEventListener('input', () => {
      this.map.render();
    }, false);
    this.initLayers();
    this.createMap();
    this.map.addInteraction(modify);
    this.draw = new Draw({
      source: source,
      type: 'Point'
    });
    this.snap = new Snap({source: source});
    this.map.removeInteraction(this.draw);
  },
  methods: {
    upd: function (values) {
      this.orderIds = values.map(item => item.id);
      this.layerStyles = [values];
      this.filter();
    },
    onSelect(items) {
      this.selected = items
    },
    retry: function () {
      this.initLayers()
    },
    addLayer: function (name) {
      if (name.indexOf('v_') + 1) {
        this.layers.push(
          new VectorLayer({
            source: new VectorSource({
              format: new GeoJSON(),
              url: `http://nuolh.belstu.by:4201/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${name}&srsName=EPSG:3857&outputFormat=application%2Fjson`,
            })
          })
        );
      } else {
        this.layers.push(
          new TileLayer({
            source: new TileWMS(
              ({
                url: `http://nuolh.belstu.by:4201/geoserver/cite/wms`,
                params: {
                  'LAYERS': name,
                  'TILED': true,
                  'STYLES': ''
                },
                title: 'SPA'
              })
            ),
          }),
        );
      }
    },

    renderFeatures: function (features, style) {
      console.log(features)
      let vectorSource = new VectorSource({
        features: features,
      });
      let ftlayer = new VectorLayer({
        source: vectorSource,
        style: style
      })
      this.layers.push(ftlayer)
      this.map.addLayer(ftlayer)
    },

    customStyleFunction: function(feature, fillColor = '#00f000') {
      let stroke = new Stroke({
        color: 'orange',
        width: 1,
      })
      let fill = new Fill({
        color: fillColor
      })
      return new Style({
        image: new CircleStyle({
          radius: 20,
          fill: new Fill({color: 'rgba(150, 0, 0, 0.5)'}),
          stroke: new Stroke({color: '#000000', width: 1})
        }),
        stroke: stroke,
        fill: fill,
      })
    },

    getFeaturesForLayer: function (layerName) {
      axios
        .get(
          `http://nuolh.belstu.by:4201/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layerName}&srsName=EPSG:3857&outputFormat=application%2Fjson`,
          {headers: {
              "Authorization" : "Basic "+Buffer.from("admin:gT5$eSzXcVfR").toString('base64')
            }
          }
        ).then(response => {
        const data = response.data;
        console.log(data)
        let features = []
        if(data.features) {
          features = (new GeoJSON({
            dataProjection: 'EPSG:4326'
          })).readFeatures(data)
          features.forEach((feature) => {
            let af = feature
            af['layerName'] = layerName
            this.layerFeatures.push(af)
          })
          this.selectedFilters[layerName] = Object.keys(features[0].values_)
        }
      })
    },
    getStylesForLayer: function (layerName) {
      let styles = [];
      axios.get(`http://nuolh.belstu.by:4201/geoserver/rest/layers/${layerName}.json`,
			{headers: {
				"Authorization" : "Basic "+Buffer.from("admin:gT5$eSzXcVfR").toString('base64')
			  }
			})
        .then(res => {
          this.addLayer(layerName);
          this.layerNames.push(layerName);
          this.getFeaturesForLayer(layerName);
          styles.push(res.data.layer.defaultStyle.name);
          if (res.data.layer.styles) {
            res.data.layer.styles.style.forEach(style => {
              styles.push(style.name);
            })
          }
          this.selectedStyles.push({name: res.data.layer.defaultStyle.name});
          const haveStyles = (layerName.indexOf('v_') + 1) ? false : true
          this.layerStyles.push({
            id: this.layerStyles.length,
            name: layerName.split('_')[1],
            styles: [...styles],
            selectedStyle: res.data.layer.defaultStyle.name,
            haveStyles: haveStyles
          });
        })
        .catch(() => {
        })
    },
    initLayers: function () {
      this.layerNames = [];
      this.layers = [];
      this.loading = true;
      this.noConn = false;
      axios
        .get(
			`http://nuolh.belstu.by:4201/geoserver/rest/layers.json`,
			{headers: {
				"Authorization" : "Basic "+Buffer.from("admin:gT5$eSzXcVfR").toString('base64')
			  }
			}
		)
        .then(response => {
          const data = response.data;
          data.layers.layer.forEach(layer => {
            this.getStylesForLayer(layer.name)
          });
          this.loading = false;
        }).catch(() => {
          this.loading = false;
          console.info('conn with geoserver lost');
          this.noConn = true;
        }
      )
    },
    selectStyle: function (layerId) {
      this.changingLayerId = layerId;
      this.selectedLayer = this.layerStyles[layerId];
      this.showDialog = true;
    },
    changeStyle: function () {
      if (this.layers[this.layerStyles[this.changingLayerId].id].getSource().updateParams) {
        this.layers[this.layerStyles[this.changingLayerId].id].getSource().updateParams({
          'STYLES': this.layerStyles[this.changingLayerId].selectedStyle
        });
      }
      this.showDialog = false;
    },

    clearLayer: function(layerName) {

    },

    createMap: function () {
      this.map = new Map({
        controls: defaultControls().extend([
          scaleLineControl,
          // fullScreenControl,
        ]),
        target: 'map',
        layers: [
          osm,
          aero,
          vector
        ],
        view: new View({
          center: [3016281, 7089075],
          minZoom: 1,
          zoom: 15
        })
      });
      let popup = new Overlay({
        element: document.getElementById('popup')
      });
      this.map.addOverlay(popup);
      this.map.addInteraction(singleClick);
      let m = this.map;
      this.map.on('click', function(evt) {
        var pixel = evt.pixel;
        let ftr = m.forEachFeatureAtPixel(pixel, function(feature, layer) {
          return feature;
        });
        popup.setOffset([0, 0]);
        let nativePopup = document.getElementById('popup')
        if (ftr) {
          var props = ftr.getProperties();
          console.log(props)
          var coordinates = this.getCoordinateFromPixel(evt.pixel);
          var info = "<h2><a target='_blank' href='" + props.name + "'>" + `Подробнее о ${props.name_code || 'Стационар'}` + "</a></h2>";
          popup.setPosition(coordinates);
          nativePopup.innerHTML = info
          nativePopup.hidden = false
        } else {
          nativePopup.hidden = true
        }

      });
      singleClick.on('select', (e) => {
        console.log(e)
        let id = parseInt(e.selected[0].get('name'), 10);
        singleClick.getFeatures().clear();
        // axios.get(`http://nuolh.belstu.by:3000/static/${id}`)
        //   .then(res => {
        //     const dom = res.data;
        //     const arr = dom.split('\n');
        //     let arr2 = [];
        //     for (let i = 1; i < arr.length - 2; i++) {
        //       arr2.push(`http://nuolh.belstu.by:3000/static/${id}/` + arr[i].split('\"')[1]);
        //     }
        //     this.picsArr = arr2;
        //     this.map.removeInteraction(e)
        //     console.log('dialog!');
        //     this.photosDialog = true;
        //   })
        //   .catch(() => {
        //   })
      });
    },
    addDrawInteraction: function () {
      this.map.addInteraction(this.draw);
    },
    removeDrawInteraction: function () {
      this.map.removeInteraction(this.draw);
    },

    filterFeatureBy() {
      let allIds = this.layers.map(function (currentValue, index) {
        return `${index}`
      });
      allIds.forEach(id => {
        this.map.removeLayer(this.layers[id])
      });
      let selectedFeatures;
      if(this.filter_option === 'num_lch') {
        selectedFeatures = this.layerFeatures.filter((ftr) => {
          return ftr.values_.num_lch == this.filter_value
        })
      }
      else if(this.filter_option === 'num_kv') {
        selectedFeatures = this.layerFeatures.filter((ftr) => {
          return ftr.values_.num_kv == this.filter_value
        })
      }
      else return;
      this.renderFeatures(selectedFeatures, this.customStyleFunction(null, reservedStyles[0]));
    },

    filter() {
      let allIds = this.layers.map(function (currentValue, index) {
        return `${index}`
      });
      allIds.forEach(id => {
        this.map.removeLayer(this.layers[id])
      });
      if (this.orderIds.length) {
        this.orderIds.forEach(orderId => {
          this.selectedIds.forEach((id) => {
            if (orderId == id) {
              this.map.addLayer(this.layers[id]);
            }
          });
        })
      } else {
        this.selectedIds.forEach((id) => {
          let ftrs = this.layerFeatures.filter((feat) => {
            return feat.layerName == `cite:_${this.layerStyles[id].name}`
          })
          this.renderFeatures(ftrs, this.customStyleFunction(ftrs, reservedStyles[id]))
        });
      }

      this.showDialog = false;
    },
    changePointer() {
      this.map.getView().setCenter([3016281, 7089075]);
      this.map.getView().setZoom(11);
      // if (this.pointsAdding) {
      //   this.removeDrawInteraction();
      // } else {
      //   this.addDrawInteraction();
      // }
      // this.pointsAdding = !this.pointsAdding;
    }
  }
};
