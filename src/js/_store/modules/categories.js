import axios from '@Helpers/axiosDefault';

export default {
  namespaced: true,
  state: {
    loading: false,
    errorMessage: '',
    doneMessage: '',
    categoryList: [],
    deleteCategoryId: null,
    deleteCategoryName: '',
    updateCategoryId: null,
    updateCategoryName: '',
  },
  getters: {
    categoryList: state => state.categoryList,
  },
  actions: {
    clearMessage({ commit }) {
      commit('clearMessage');
    },
    getAllCategories({ commit, rootGetters }) {
      axios(rootGetters['auth/token'])({
        method: 'GET',
        url: '/category',
      }).then((response) => {
        const payload = { categories: [] };
        response.data.categories.forEach((val) => {
          payload.categories.push(val); // リストにpushして表示している。更新の際にも使用できるかも。
        });
        commit('doneGetAllCategories', payload);
      }).catch((err) => {
        commit('failFetchCategory', { message: err.message });
      });
    },
    confirmDeleteCategory({ commit }, { categoryId, categoryName }) {
      commit('confirmDeleteCategory', { categoryId, categoryName });
    },
    deleteCategory({ commit, rootGetters }, categoryId) {
      return new Promise((resolve) => {
        axios(rootGetters['auth/token'])({
          method: 'DELETE',
          url: `/category/${categoryId}`,
        }).then((response) => {
          // NOTE: エラー時はresponse.data.codeが0で返ってくる。
          if (response.data.code === 0) throw new Error(response.data.message);
          commit('doneDeleteCategory');
          resolve();
        }).catch((err) => {
          commit('failFetchCategory', { message: err.message });
        });
      });
    },
    resisterCategory({ commit, rootGetters }, { category }) {
      return new Promise((resolve) => { // 指定したvalueデータを受け取っている。
        commit('toggleLoading');
        const data = new URLSearchParams();
        // console.log(this.state.categories.updateCategoryId);何も値が入っていなかった。
        // console.log(category); // 入力されたcategoryに値が入ってくる。
        data.append('name', category); // 登録の際は、nameのみとAPIに書いてあるので、nameのみ。ここでは、categoryが入力された値のため、
        axios(rootGetters['auth/token'])({
          method: 'POST',
          url: '/category',
          data,
        }).then((response) => {
          const payload = { categories: [] }; // 空の配列が入っているため、一件しか表示されていない？
          payload.categories.push(response.data.category); // リストにpushして表示している。更新の際にも使用できるかも。
          commit('AddDoneMessage');
          commit('toggleLoading');
          resolve();
        }).catch((err) => {
          // console.log('通信失敗');
          commit('failFetchCategory', { message: err.message });
          commit('toggleLoading');
        });
      });
    },
  },
  mutations: {
    clearMessage(state) {
      state.errorMessage = '';
      state.doneMessage = '';
    },
    doneGetAllCategories(state, { categories }) {
      state.categoryList = [...categories];
      // console.log(categories);
    },
    failFetchCategory(state, { message }) {
      state.errorMessage = message;
    },
    toggleLoading(state) {
      state.loading = !state.loading;
    },
    confirmDeleteCategory(state, { categoryId, categoryName }) {
      state.deleteCategoryId = categoryId;
      state.deleteCaxtegoryName = categoryName;
    },
    doneDeleteCategory(state) {
      state.deleteCategoryId = null;
      state.deleteCategoryName = '';
      state.doneMessage = 'カテゴリーの削除が完了しました。';
    },
    // -------------------------追加したもの。-----------------------------------------
    AddDoneMessage(state) {
      state.errorMessage = '';
      state.doneMessage = 'カテゴリーの追加が完了しました';
    },
  },
};
