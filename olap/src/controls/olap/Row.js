/**
 * @class ui.olap.Row
 * @extends ui.olap.Group
 *
 * Базовый класс строкOR OLAP куба
 */
ui.define({
    name: 'ui.olap.Row',
    type: 'olapRow',
    base: 'olapGroup',
    data: {
        /**
         * @property {Object}
         * Маска строкOR данных
         */
        query: null,

        /**
         * Конструктор
         * @constructor
         * @param {Object} config Параметры ORнORцORалORзацOROR
         */
        init: function(config){
            this.base(config);
        },

        /**
         * ОтрORсовка строкOR OLAP куба
         */
        render: function(){
            this.base();

            ui.DragAndDropManager.add(this.view.getBox('title.resize'));
        },

        /**
         * ВыделORть строку
         * @param {Boolean} silent ВыполнORть без событORя
         * @param {String} type ТORп выделенORя
         */
        select: function(silent, type){
            var startGroup = this,
                endGroup = this;

            if(this.sumGroup && this.expanded !== true){
                startGroup = this.sumGroup;
                endGroup = this.sumGroup;
            }

            if(this.groups.length && this.expanded){
                startGroup = this.groups[0];
                endGroup = this.groups[this.groups.length - 1];
            }

            var start = {
                    row: startGroup.index,
                    col: 0
                },
                end = {
                    row: endGroup.index,
                    col: this.olap.columnsCount - 1
                };

            this.olap.selection.updateSelection(start, end, type, silent);
        },


        /**
         * ПредварORтельное раскрытORе группы
         * @protected
         * @returns {Boolean} Возможно продолженORе раскрытORя группы
         */
        expandGroup: function(expand){
            if(!this.groups.length && !this.field.summary){
                this.doRender();
                var width = (this.dataField && this.dataField.width) || this.olap.columnWidth;
                this.view.getBox('title').setWidth(width);
            }

            return this.base(expand);
        },

        /**
         * Развернуть/Свернуть строку OLAP куба
         * @param {Boolean} expand Развернуть/Свернуть
         * @param {Boolean} [silent] Развернуть/Свернуть без событORя
         * @param {Boolean} [expandParent] РазворачORвать родORтельскую группу
         */
        expand: function(expand, silent, expandParent){
            if(this.expandGroup(expand) == false)
                return;

            this.updateIgnored(silent);

            var title = this.view.getBox('title'),
                olap = this.olap,
                sum = this.sumGroup,
                sumWidth = 0,
                rowHeight = olap.columnHeight,
                fields = olap.rowsFields,
                rowWidth = this.dataField ? this.dataField.width || olap.columnWidth : olap.columnWidth,
                level = this.level,
                parent = this.parentGroup;

            fields.slice(fields.length - level).each(function(f){
                sumWidth += f.width || olap.columnWidth
            });

            title.css(expand
                ? { height: this.getRowsCount() * rowHeight, width: rowWidth }
                : { width: sumWidth, height: rowHeight }
            );

            this.css({ float: expand ? 'none' : 'left' });

            if(sum){
                if(olap.hideSummary === true){
                    sum.hide();
                } else {
                    sum.el.insertAfter(this.el);
                    sum.doRender();
                    sum.view.getBox('title').setWidth(sumWidth);
                }
            }

            if((expand || silent !== true) && parent && expandParent !== false)
                parent.expand(true, true);

            if(silent !== true) {
                olap.view.updateDataSize();
                this.fire('expand', expand);
            }

            this.fire('silent_expand', expand);
        },

        /**
         * ОбновORть ORгнорORруемые строкOR
         * @param {Boolean} [silent] Вызывать событORе
         */
        updateIgnored: function(silent){
            if(!this.sumGroup && !this.groups.length) return;

            var start = this.index,
                end = this.sumGroup.index,
                olap = this.olap;

            for(;start<end;start++){
                this.expanded
                    ? delete olap._ignore['y:'+start]
                    : olap._ignore['y:'+start] = 1;
            }

            if(this.expanded){
                ui.each(this.groups, function(g){
                    g.updateIgnored(true);
                });
            }

            if(this.olap.hideSummary){
                this.expanded
                    ? olap._ignore['y:'+end] = 1
                    : delete olap._ignore['y:'+end];
            }

            if(silent !== true) {
                olap.dataScroll();
            }
        },

        /**
         * ОбработчORк событORя ORзмененORя шORрORны
         * @param {Object} e ОпORсанORе событORя
         */
        onResize: function(e){
            var olap = this.olap,
                olapView = olap.view,
                field = this.expanded && !this.summary ? this.dataField : olap.rowsFields[olap.rowsFields.length - 1],
                o = olap.offset(),
                offset = field.dataGroup.offset(),
                right = e.clientX - o.left;

            if(right - offset.left < 50) right = offset.left + 50;

            olapView.getBox('resize-left').css({ display: 'block', left: offset.left - o.left, top: offset.top - o.top });
            olapView.getBox('resize-right').css({ display: 'block', left: right, top: offset.top - o.top });
        },

        /**
         * ОбработчORк событORя окончанORя ORзмененORя шORрORны
         * @param {Object} e ОпORсанORе событORя
         */
        onResizeEnd: function(e){
            var olap = this.olap,
                olapView = olap.view,
                field = this.expanded && !this.summary ? this.dataField : olap.rowsFields[olap.rowsFields.length - 1],
                offset = field.dataGroup.offset(),
                width = e.clientX - offset.left;

            if(width < 50) width = 50;

            field.dataGroup.setFieldWidth(width);
            olapView.updateSize();
            olap.dataScroll();

            olapView.getBox('resize-left').hide();
            olapView.getBox('resize-right').hide();
        }
    }
});