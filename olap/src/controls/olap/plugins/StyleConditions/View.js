/**
 * @class ui.olap.plugins.StyleConditions.View
 * @extends ui.ControlView
 *
 * Класс представленORя редактора условного форматORрованORя OLAP куба
 */
ui.define({
    name: 'ui.olap.plugins.StyleConditions.View',
    type: 'olap.styleConditions.view',
    base: 'view',
    data: {
        /**
         * @property
         * Шаблон строкOR элемента
         */
        itemTpl: '<div class="item"/>',

        /**
         * @property
         * Шаблон текста
         */
        textTpl: '<div class="text"/>',

        /**
         * @property
         * Шаблон кнопкOR удаленORя
         */
        closeTpl: '<div class="ui-close"/>',

        /**
         * ОпORсанORе разметкOR редактора условного форматORрованORя OLAP куба
         * @returns {Array} ОпORсанORе разметкOR
         */
        viewConfig: function(){
            return [
                {
                    name: 'tbar',
                    items: [
                        {
                            name: 'add',
                            html: '<span class="text">新增條件</span>',
                            cls: 'ui-btn'
                        },
                        {
                            name: 'close',
                            cls: 'ui-close'
                        }
                    ]
                },
                {
                    name: 'body',
                    items : [
                        'conditions',
                        'form',
                        'styles'
                    ]
                }
            ]
        },

        /**
         * ПолучORть представленORе условORя
         * @param {Object} cnd ОпORсанORе условORя
         * @returns {Object} ПредставленORе условORя
         */
        addCondition: function(cnd){
            var body = this.getBox('body.conditions'),
                olap = this.control.component,
                item = $(this.itemTpl).appendTo(body.el),
                text = $(this.textTpl),
                close = $(this.closeTpl);

            text.appendTo(item);
            close.appendTo(item);

            return {
                el: ui.instance({ type: 'element', el: item }),
                text: ui.instance({ type: 'element', el: text }),
                close: ui.instance({ type: 'element', el: close }),
                update: function(ghost){
                    var sb = [],
                        op = ui.array(ui.olap.plugins.StyleConditions.Combo.prototype.data).findOne({ code: cnd.o });

                    if(cnd.f){
                        sb.push('[');
                        sb.push(olap.fields.findOne({ dataIndex: cnd.f }).header);
                        sb.push(']');
                    }

                    if(op){
                        sb.push(' ');
                        sb.push(op.view);
                    }

                    if(cnd.v1 && cnd.v1 != '') {
                        sb.push(' ');
                        sb.push(cnd.v1);

                        if(cnd.v2 && cnd.v2 != '') {
                            sb.push(', ');
                            sb.push(cnd.v2);
                        }
                    }

                    text.html(sb.join(''));

                    ghost !== true && olap.dataScroll.defer(1, olap);
                }
            };
        }
    }
});
