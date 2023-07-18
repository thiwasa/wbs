'use strict';

class subGrid {
  constructor (strGridId) {
    this.gridId = strGridId;
    this.grid;
    this.dataView = new Slick.Data.DataView();
    
    this.columns = [];
    this.options = {
      'editable': true,
      'enableCellNavigation': true,
      'asyncEditorLoading': true,
      'showHeaderRow': true,
      'headerRowHeight': 27,
      'explicitInitialization': true,
      'enableAsyncPostRender': true,
      'autoEdit': true,   
    };
  }

  // initGrid() {
  //   this.dataView = new Slick.Data.DataView({ inlineFilters: true });
  //   this.grid = new Slick.Grid(this.gridId, this.dataView, this.columns, this.options);
  // }

  // var grid;
  // var columns = [
  //   {id: "title", name: "Title", field: "title"},
  //   {id: "duration", name: "Duration", field: "duration"},
  //   {id: "%", name: "% Complete", field: "percentComplete"},
  //   {id: "start", name: "Start", field: "start"},
  //   {id: "finish", name: "Finish", field: "finish"},
  //   {id: "effort-driven", name: "Effort Driven", field: "effortDriven"}
  // ];

  // var options = {
  //   enableCellNavigation: true,
  //   enableColumnReorder: false
  // };

  // $(function () {
  //   var data = [];
  //   for (var i = 0; i < 500; i++) {
  //     data[i] = {
  //       title: "Task " + i,
  //       duration: "5 days",
  //       percentComplete: Math.round(Math.random() * 100),
  //       start: "01/01/2009",
  //       finish: "01/05/2009",
  //       effortDriven: (i % 5 == 0)
  //     };
  //   }

  //   grid = new Slick.Grid("#myGrid", data, columns, options);
  // })

}


// class subGrid {
//     var grid;
//     var columns = [
//     {id: "title", name: "Title", field: "title"},
//     {id: "duration", name: "Duration", field: "duration"},
//     {id: "%", name: "% Complete", field: "percentComplete"},
//     {id: "start", name: "Start", field: "start"},
//     {id: "finish", name: "Finish", field: "finish"},
//     {id: "effort-driven", name: "Effort Driven", field: "effortDriven"}
//   ];

//   var options = {
//     enableCellNavigation: true,
//     enableColumnReorder: false
//   };

//   $(function () {
//     var data = [];
//     for (var i = 0; i < 500; i++) {
//       data[i] = {
//         title: "Task " + i,
//         duration: "5 days",
//         percentComplete: Math.round(Math.random() * 100),
//         start: "01/01/2009",
//         finish: "01/05/2009",
//         effortDriven: (i % 5 == 0)
//       };
//     }

//     grid = new Slick.Grid("#myGrid", data, columns, options);
//   })
// }