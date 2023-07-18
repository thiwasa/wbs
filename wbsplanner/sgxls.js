'use strict';

function cpGrid(strGridId, data) {
  this.gridID = '#' & strGridId;
  this.data = data;
  this.gridID;

}

// function cpGrid(strGridID, data) {
//   this.gridID = strGridID;
//   this.grid;
//   this.dataView = data;
//   this.column = [
//     { id: 'ed_estimate_sub_no', name: '枝番', field: 'ed_estimate_sub_no', width: 50, },
//     { id: 'ed_sub_08', name: '寸法➀', field: 'ed_sub_08', editor: Slick.Editors.Text, cssClass: 'right-align', width: 60, },
//     { id: 'ed_sub_10', name: '寸法➀補足', field: 'ed_sub_10', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 60, },
//     { id: 'ed_sub_09', name: '寸法➁', field: 'ed_sub_09', editor: Slick.Editors.Text, cssClass: 'right-align', width: 70, },
//     { id: 'ed_sub_11', name: '寸法➁補足', field: 'ed_sub_11', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 70, },
//     { id: 'ed_quantity', name: '受注数', field: 'ed_quantity', editor: Slick.Editors.Integer, cssClass: 'right-align', width: 50, },
//     { id: 'ed_p_unit', name: '単位', field: 'ed_p_unit', formatter: function (r, c, v, cD, dC) { return masterFormatterProdUnit(dC, 'ed_p_unit', dC['ed_p_cd']); }, maxlength: 10, width: 50, },
//     { id: 'ed_customer_order_no', name: '先方注文No.', field: 'ed_customer_order_no', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150, },
//     { id: 'ed_customer_p_name', name: '図番/JobCD or 先方品名', field: 'ed_customer_p_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150, },
//   ];

//   this.options = {
//     editable: true,
//     enableAddRow: true,
//     enableCellNavigation: true,
//     asyncEditorLoading: false,
//     autoEdit: false
//   }
  
//   this.undoRedoBuffer = {
//     commandQueue: [],
//     commandCtr: 0,

//     queueAndExecuteCommand: function (editCommand) {
//       this.commandQueue[this.commandCtr] = editCommand;
//       this.commandCtr++;
//       editCommand.execute();
//     },

//     undo: function () {
//       if (this.commandCtr == 0) { return; }

//       this.commandCtr--;
//       var command = this.commandQueue[this.commandCtr];

//       if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
//         command.undo();
//       }
//     },
//     redo: function () {
//       if (this.commandCtr >= this.commandQueue.length) { return; }
//       var command = this.commandQueue[this.commandCtr];
//       this.commandCtr++;
//       if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
//         command.execute();
//       }
//     }
//   }

//   this.pluginOptions = {
//     clipboardCommandHandler: function (editCommand) { undoRedoBuffer.queueAndExecuteCommand.call(undoRedoBuffer, editCommand); },
//     readOnlyMode: false,
//     includeHeaderWhenCopying: false,
//     newRowCreator: function (count) {
//       for (var i = 0; i < count; i++) {
//         var item = {
//           id: "newRow_" + newRowIds++
//         }
//         grid.getData().addItem(item);
//       }
//     }
//   };
// }


// $(function () {
//   grid = new Slick.Grid("#myGrid", dataView, columns, options);
//   grid.setSelectionModel(new Slick.CellSelectionModel());
//   grid.registerPlugin(new Slick.AutoTooltips());

//   // set keyboard focus on the grid
//   grid.getCanvasNode().focus();

//   grid.registerPlugin(new Slick.CellExternalCopyManager(pluginOptions));

//   grid.onAddNewRow.subscribe(function (e, args) {
//     var item = args.item;
//     var column = args.column;
//     grid.invalidateRow(dataView.length);
//     dataView.push(item);
//     grid.updateRowCount();
//     grid.render();
//   });

// })
