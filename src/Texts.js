var MEI2TEXT = ( function(m2t, VF, $, undefined) {

    /**
     * @class MEI2TEXT.Texts
     * @private
     *
     * @constructor
     */
    m2t.Texts = function() {
      var me = this;
      me.complexTextModels = [];
      me.defaultFontSize = 25;
      me.lineHeight = 1.3;
    };

    m2t.Texts.prototype = {

      addComplexText : function(element, coords) {
        var me = this;
        me.resetTempText();
        me.htmlToArray(element, {});
        me.complexTextModels.push({
          coords : coords,
          texts : me.textArray
        });
      },

      resetTempText : function() {
        this.textArray = [[]];
        this.line_n = 0;
      },

      htmlToArray : function(element, opts) {
        var me = this, obj, attObj, defaults, text;

        $(element).contents().each(function() {

          if (this.nodeName === '#text') {
            text = this.textContent.replace(/([\n|\r]+\s*)/g, '');
            if (text) {
              me.textArray[me.line_n].push({
                text : text,
                opts : opts
              });
            }
          } else {
            switch (this.localName) {
              case undefined :
                break;
              case 'lb' :
                me.breakLine();
                break;
              case 'title' :
                attObj = MEI2VF.Util.attsToObj(this);
                defaults = {
                  el : this.localName,
                  halign : 'center',
                  fontsize : (attObj.type === 'sub') ? 35 : 50,
                  fontweight : 'Bold'
                };
                obj = $.extend({}, opts, defaults, attObj);
                me.htmlToArray(this, obj);
                me.breakLine();
                break;
              default :
                obj = $.extend({}, opts, MEI2VF.Util.attsToObj(this));
                me.htmlToArray(this, obj);
            }
          }
        });
      },

      breakLine : function() {
        var me = this;
        me.line_n += 1;
        me.textArray[me.line_n] = [];
      },

      setContext : function(ctx) {
        this.ctx = ctx;
        return this;
      },

      draw : function() {
        var me = this, coords, leftTexts, centerTexts, rightTexts, maxFontSizeInLine, i;

        var processText = function () {
            leftTexts = [];
            centerTexts = [];
            rightTexts = [];
            maxFontSizeInLine = 0;
            $.each(this, function() {
              switch (this.opts.halign) {
                case 'center' :
                  centerTexts.push(this);
                  break;
                case 'right' :
                  rightTexts.push(this);
                  break;
                default :
                  leftTexts.push(this);
              }
            });

            maxFontSizeInLine = Math.max(me.drawCenterTexts(centerTexts, coords), me.drawRightAlignedTexts(rightTexts, coords), me.drawLeftAlignedTexts(leftTexts, coords));

            coords.y += maxFontSizeInLine * me.lineHeight;          
        };

        i = me.complexTextModels.length;
        while (i--) {
          coords = me.complexTextModels[i].coords;
          $.each(me.complexTextModels[i].texts, processText);
        }
      },

      drawCenterTexts : function(centerTexts, coords) {
        var me = this, fontsize, maxFontSize, fontweight, fontstyle, totalTextWidth = 0;

        $.each(centerTexts, function() {
          fontsize = this.opts.fontsize || me.defaultFontSize;
          fontweight = this.opts.fontweight || '';
          fontstyle = this.opts.fontstyle || '';
          me.ctx.font = fontstyle + ' ' + fontweight + ' ' + fontsize + 'px Times';
          totalTextWidth += me.ctx.measureText(this.text).width;
        });

        maxFontSize = me.drawLeftAlignedTexts(centerTexts, {
          x : coords.x + (coords.w / 2) - (totalTextWidth / 2),
          y : coords.y,
          w : coords.w
        }, me.ctx);
        return maxFontSize;
      },

      drawLeftAlignedTexts : function(leftTexts, coords) {
        var me = this, fontsize, maxFontSize = 0, fontweight, fontstyle, offsetX = 0;
        $.each(leftTexts, function() {
          fontsize = this.opts.fontsize || me.defaultFontSize;
          maxFontSize = Math.max(fontsize, maxFontSize);
          fontweight = this.opts.fontweight || '';
          fontstyle = this.opts.fontstyle || '';
          me.ctx.font = fontstyle + ' ' + fontweight + ' ' + fontsize + 'px Times';
          me.ctx.textAlign = 'left';
          me.ctx.fillText(this.text, coords.x + offsetX, coords.y);
          offsetX += me.ctx.measureText(this.text).width;
        });
        return maxFontSize;
      },

      drawRightAlignedTexts : function(rightTexts, coords) {
        var me = this, fontsize, maxFontSize = 0, fontweight, fontstyle, offsetX = 0, obj, i;
        i = rightTexts.length;
        while (i--) {
          obj = rightTexts[i];
          fontsize = obj.opts.fontsize || me.defaultFontSize;
          maxFontSize = Math.max(fontsize, maxFontSize);
          fontweight = obj.opts.fontweight || '';
          fontstyle = obj.opts.fontstyle || '';
          me.ctx.font = fontstyle + ' ' + fontweight + ' ' + fontsize + 'px Times';
          me.ctx.textAlign = 'right';
          me.ctx.fillText(obj.text, coords.x + coords.w - offsetX, coords.y);
          offsetX += me.ctx.measureText(obj.text).width;
        }
        return maxFontSize;
      }
    };

    return m2t;

  }(MEI2TEXT || {}, Vex.Flow, jQuery));
