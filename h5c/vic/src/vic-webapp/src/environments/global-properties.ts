export const globalProperties = {
  // vic service
  vicService: {
    paths: {
      base: '/ui/vic/rest/data/',
      get properties () {return `${this.base}properties/`},
      get list () {return `${this.base}list/`},
      get propertiesByRelation () {return `${this.base}propertiesByRelation/`},
    }
  }
};
