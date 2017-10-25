import connect from '../../utils/connect.js';
import carousel from '../../components/carousel/carousel.js';
import picker from '../../components/picker-time/picker.js';
import wx, { mergeOptions } from '../../utils/wx.js';

const page = mergeOptions({
  onLoad(options) {
     this.queryWeather();
  },
},picker);

const mapState = ({index, loading}) => {
  return {
    ...index,
    loading,
  };
};

const mapFunc = (dispatch) => {
  return {
    queryWeather(){
      dispatch({ type: 'index/queryWeather' });
    },

    queryLocation() {
      dispatch({ type: 'app/getLocation' });
    },

    onTapCarouselItem(e) {
      dispatch({
        type: 'index/onTapCarousel',
        payload: { pic: e.currentTarget.dataset.pic }
      });
    },
    bindDateChange(e) {
      console.log(e);
      dispatch({
        type: 'index/bindDateChange',
        payload: { value: e.detail.value }
      }); 
    }

  };
};

Page(connect(mapState, mapFunc)(page));
