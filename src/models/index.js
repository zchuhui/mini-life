import api from '../utils/api/api.js';
import wx from '../utils/wx.js';
import moment from 'moment';
import { isEmpty } from 'lodash';

export default {
  namespace: 'index',

  state: {
    title: 'Hello',
    date: null,
    quantity:100,
    waste:0,
  },

  reducers: {
    queryWeatherSuccess(state, action) {
      const { weather } = action.payload;
      return {
        ...state,
        weather,
      };
    },

    getLocationSuccess(state, action) {
      const { location } = action.payload;
      return {
        ...state,
        location,
      };
    },

    getUserInfoSuccess(state, action) {
      const { userInfo } = action.payload;
      return {
        ...state,
        userInfo,
      };
    },

    saveDateSuccess(state, action) { 
      // 生日
      const birthday = action.payload.value;
      // 今天
      const today = moment().format('YYYY-MM-DD');
      // 平均寿命天数
      const life = 75.99 * 365;
      // 你已经活了多少天
      const dayCount = compareDate(birthday,today);
      // 剩下电量
      const quantity = ((life-dayCount)/life * 100).toFixed(2);
      // 已耗费
      const waste = (dayCount/life*100).toFixed(2);

      function compareDate(start,end){ 
        if(start==null||start.length==0||end==null||end.length==0){ 
            return 0; 
        }
         
        var arr=start.split("-");  
        var starttime=new Date(arr[0],parseInt(arr[1]-1),arr[2]);  
        var starttimes=starttime.getTime(); 
         
        var arrs=end.split("-");  
        var endtime=new Date(arrs[0],parseInt(arrs[1]-1),arrs[2]);  
        var endtimes=endtime.getTime(); 
         
        var intervalTime = endtimes-starttimes;//两个日期相差的毫秒数 一天86400000毫秒 
        var Inter_Days = ((intervalTime).toFixed(2)/86400000)+1;//加1，是让同一天的两个日期返回一天 
         
        return Inter_Days; 
      }; 

      return {...state,date:birthday,quantity:quantity,waste:waste}
    }
  },

  effects: {
    *queryWeather(action, { call, put }) {
      wx.showLoading({ title: '获取天气中' });
      try {
        const weather = yield call(api.queryWeather);
        wx.hideLoading();
        yield put({ type: 'queryWeatherSuccess', payload: { weather } });
      } catch (e) {
        /* handle error */
        wx.hideLoading();
        console.log('weather error', e);
      }
    },

    *onTapCarousel(action, { select }) {
      const { pic } = action.payload;
      const { carousel } = yield select(state => state.index);
      const pics = carousel.images.map(img => img.imgUrl);
      wx.previewImage({
        current: pic.imgUrl,  // 当前显示图片的http链接
        urls: pics,           // 需要预览的图片http链接列表
      });
    },

    *bindDateChange(action, { put }) {
      const { value } = action.payload;
      yield put({type:'saveDateSuccess', payload:{value}})
    },  

    *watchLocation(action, { put, take, select, takeEvery }) {
      let { location } = yield select(state => state.app );
      if (!location) {
        yield takeEvery('app/getLocationSuccess', function* (action1) {
            location = action1.payload;
            yield put({ type: 'getLocationSuccess', payload: { location } });
        });
      } else {
        yield put({ type: 'getLocationSuccess', payload: { location } });
      }
    },
    
    *watchLogin(action, { call, put, take, select, takeEvery }) {
      let { userInfo } = yield select(state => state.app );

      if (isEmpty(userInfo)) {
        const action1 = yield take('app/getUserInfoSuccess');
        userInfo = action1.payload.userInfo;
      }

      yield put({ type: 'getUserInfoSuccess', payload: { userInfo } });

    }
  },

  subscriptions: {
    //监控获取用户信息
    setup({ dispatch }) {
      dispatch({ type: 'watchLogin' });
    },

    //监控位置变化
    watchLocation({ dispatch }) {
      //dispatch({ type: 'watchLocation' });
    }
  }
}
