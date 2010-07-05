(function($){
	$.fn.form=function(o) {
		o=$.extend({ form: this.is("form")? this : this.parents("form") }, o);
		o=$.extend({
			self: 			this,
			before: 		function(o) {},
			test: 			function(o) {return true;},
			after: 			function(o) {},
			success: 		function(o) {},
			error: 			function(o) {},
			errors: 		function(o) {},
			load: 			function(o) {},
			validation:		false,
			infoClass:  	"info",
			errorClass: 	"error",
			extraUrl: 	 	"",
			ajax:	 		o.ajax || o.success || o.error,
			enhance: 		false,
			input:			this.is("input")? this : o.form.find("input:submit"),
			data:			"",
			url:			o.form.attr("action"),
			nofile:			!o.form.find("input:file").length
		}, o);	
		o.url += o.extraUrl;
		
		if(o.enhance) $.fn.form.enhance(o);
		if(o.autogrow) $.fn.form.autogrow(o);
		if(o.ajax) {
			o.form.find('input').focus(function(){this.blur()});
			o.form.submit(function() { 				
				o.dataArray = o.form.serializeArray();
				$.fn.form.submit(o); return false; 
			});
			
		}
		if(o.load) o.load(o);
		return this;
	};
	
	$.fn.delegate_form=function(o,f,id,ifr,old,c){
		//return this.form($.extend(o, { delegate: true });
	};
		
	$.fn.formSubmit = function(o) { this.form(o); $.fn.form.submit(o); return this; };
	$.fn.form.submit = function(o){
		if(o.input.is(':submit')) o.dataArray.push({name: o.input.attr('name'), value: o.input.val()});
		o.before(o);
		if(!o.test(o)) return this;		
		//if(!o.nofile){id='__uploadfile'+(new Date().getTime());ifr=$('<iframe id="'+id+'" name="'+id+'" src="about:blank"></iframe>').css({position:'absolute',left:-9000,top:0,zIndex:99999999}).appendTo("body");old = {target:o.form.attr('id'),action:o.form.attr('action'),encoding:o.form.attr('encoding'),enctype:o.form.attr('enctype'),method:o.form.attr('method')};o.form.attr({target:id,action:o.url,encoding:'multipart/form-data',enctype:'multipart/form-data',method:'POST'}).trigger('submit');c=function(ifr){ifr=$(this);var b=ifr.contents().find('body');if(!b.length)setTimeout(c,100);o.data=b.html();setTimeout(function(){ifr.remove().empty();ifr=null;},200);$.fn.submit.after(o);o.form.attr(old);};setTimeout(function(){ifr.one('load',c);},10);}
		//else{
			//$.post(o.url,o.dataArray,function(d){o.data=d;$.fn.submit.after(o);});			
			$.ajax({
				type: o.form.attr('method') ? o.form.attr('method') : 'POST',
        		dataType: 'html',
        		url: o.url, 
        		data: o.dataArray,        		
        		success: function(d, textStatus, XMLHttpRequest) {        
					o.data=d;$.fn.form.after(o);
        		},
        		error: function(xhr, ajaxOptions, thrownError) {          		
        			if(o.error) o.error(o, xhr, ajaxOptions, thrownError);
        			o.after(o);
        		}
			});
		//}
	};
	$.fn.form.after = function(o){
		o.after(o);		
		if(o.validation) {
			o.form.find("."+o.errorClass).removeClass(o.errorClass).find("."+o.infoClass).html("");
			if(o.data.replace(/^\s+/g,'').replace(/\s+$/g,'').charAt(0)=="{") {		
				var data = window["eval"]("("+o.data+")");
				for(var i in data) {
					var name = i.replace(/\[/g,"\\[").replace(/\]/g,"\\]");
					o.form.find(name).addClass(o.errorClass).find("."+o.infoClass).html(data[i]);
				}			
				o.errors(o);
				
			}
			else o.success(o);		
		}
		else o.success(o);		
	};

	$.fn.form.autogrow=function(o){	
		var selector = typeof o.autogrow == 'string'? o.autogrow : 'textarea';
		o.form.find(selector).each(function() {

			if(this.autogrow) return false;	
			this.autogrow = true;
			var self = $(this);
			
			if(!$.fn.form.autogrow.m)$.fn.form.autogrow.m=$('<div style="left:-9999px;top:0px;position:absolute;">').appendTo('body');
			
			if(o.width){
				var neg = parseInt(self.css("paddingLeft")) + parseInt(self.css("paddingRight"));
				$.fn.form.autogrow.m.width(o.width-neg).html(self.val().replace(/\n/g,'<br />&nbsp;'));
				o.height=parseInt($.fn.autogrow.m.height());
			}
			else {
				o.height=parseInt(self.height());
				if(o.height==0)o.height=parseInt(self.css('height'));			
				if(o.height==0)o.height=parseInt(this.offsetHeight);
			}
			self.css('overflow','hidden');
			$.fn.form.autogrow.g(o,self);
		});
		o.form.delegate(selector, "keyup", function(e){$.fn.form.autogrow.g(o,$(this));})
		return this;
	};
	$.fn.form.autogrow.g=$.browser.msie?function(o,t){			
		$.fn.form.autogrow.m.html(t.val().replace(/\n/g,'<br />&nbsp;'));
		t.height($.fn.form.autogrow.m.height()<=o.height?o.height:$.fn.form.autogrow.m.height());
	}:function(o,t){
		t.css('height','').height(t[0].scrollHeight<=o.height?o.height:t[0].scrollHeight);		
	};
	$.fn.form.autogrow.m=null;$.fn.form.autogrow.h=null;
	
	$.fn.form.enhance = function(o) {
		o = $.extend({
			color: 			"#898989",
			borderColor:	"#CCCCCC"
		}, o);		
		o.form.find("select,textarea,input:text").each(function(self,t,v,f,c,b,p,lab,select) {			
			if(!this.enhance_form && !($(this).is("input") && !$(this).is("input:text"))) 
			{				
				self = $(this);
				select=$(this).is("select");
				this.enhance_form = o;
				
				var n=self.attr("className");								
				if(n.indexOf("enhance_form{")!=-1) {
					var s=n.replace(/(.*)\enhance_form{c:(.*);b:(.*)\}(.*)/g,"$2!!$3").split("!!");
					c=s[0];b=s[1];
				}
				else{
					c=self.css("color");
					b=self.css("border-color");
					self.addClass("enhance_form{c:"+c+";b:"+b+"}");}
				
				
				$.fn.form.enhance_blur = function(e,self,o) {
					self=self||$(this);
					o=o||self[0].o;
					if($.ie7&&select)return;
                    if(self.val()==""){                       
                    	if(!select) {
    						var clone = self.clone();
    						clone.val(self.attr("pre-value"));
    						clone.removeAttr("name");
    						clone.focus(function(){
    							$(this).remove(); 
    							self.show().trigger("focus"); 
    							
    						});
    						self.after(clone).hide();
    					}                    	
                    	self.css({color:o.color,borderColor:b});
                        if(lab&&self.attr("pre-value")) lab.stop().animate({top:10}, 100, function() {$(this).hide();} );
                    }
                    else{
                        if(lab) lab.show().stop().animate({top:-4}, 100);
                        self.css({borderColor:b});
                    }
				}
				
				self[0].o = o;
				self.bind("blur", $.fn.form.enhance_blur);	
				if(self.attr("label-value")) {
					lab = $("<div style='position:relative;'><div class='label-value' style='display:none;'>"+self.attr("label-value")+"</div></div>");
					self.before(lab);
					lab = lab.find('> div').css({position:'absolute',top:10,left:5});
					if(!self.attr("pre-value")) lab.show().stop().animate({top:-4}, 100);
				}	
				if(self.val()==""){
					$.fn.form.enhance_blur(null,self,o);
					self.css({ color:o.color});
				}	
				else{ if(lab) lab.show().stop().animate({top:-4}, 100); }

				self.bind("focus",function(){
					if($.ie7&&select)return;
					self.css({color:c,borderColor:o.borderColor});
                    if(lab) {
                        if(select&&self.attr("pre-value")) lab.stop().animate({top:10}, 100, function() {$(this).hide();} );
                        else lab.show().stop().animate({top:-4}, 100);
                    }
				}).bind("keyup",function(){				
					self.css({ color:c,borderColor:o.borderColor});							
				}).bind("change",function(){					
					self.css({ borderColor:o.borderColor});
					if(lab) {
						if(this.empty&&self.attr("pre-value")) lab.stop().animate({top:10}, 100, function() {$(this).hide();} );
						else lab.show().stop().animate({top:-4}, 100);	
					}
				}).bind("mouseover",function(){					
					if($.ie7&&select)return;
                    if($(this).val()=="")self.css({color:c});
                    self.css({borderColor:o.borderColor});

				}).bind("mouseout", function(){					
					if($.ie7&&select)return;
                    if($(this).val()==""){self.css({color:o.color});}
                    self.css({borderColor:b});
				});	
			}			
		});
		return this;	
	};
	
})(jQuery);

