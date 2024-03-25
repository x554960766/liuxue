ACMS.Dispatch.ModuleDialog=function(type,callback){this.type=type;this.template="";this.callback=callback||function(){};this.modalBox=null;this.backdrop=null;this.targetMid=0};ACMS.Dispatch.ModuleDialog.prototype.resize=function($elm){var timer;$(window).resize(function(){clearTimeout(timer);timer=setTimeout(function(){var height=$(window).height();_.each($elm.find(".js-resize_to_window_height"),function(v){var offset=parseInt($(v).data("offset"));$(v).height(height-offset)})},300)}).trigger("resize")};ACMS.Dispatch.ModuleDialog.prototype.show=function(mid,tpl,bid){var self=this,bid=bid||ACMS.Config.bid,template="",focusableElements="a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), object, embed, *[tabindex], *[contenteditable]",query={edit:self.type,mid:mid};this.targetMid=mid;ACMS.Dispatch.splash();if(self.type=="insert"){template="ajax/module/edit.html"}else if(self.type==="index"){template="ajax/module/list.html";query={edit:self.type,mid:mid,tpl:tpl}}else if(self.type==="update"){template="ajax/module/edit.html"}$.ajax({type:"GET",url:ACMS.Library.acmsLink({tpl:template,bid:bid,Query:query},false),dataType:"html",success:function(res){ACMS.Dispatch.removeSplash();self.backdrop=$($.parseHTML('<div class="acms-admin-modal-backdrop"></div>')).hide().appendTo("body");self.modalBox=$($.parseHTML(res)).appendTo("body");if(self.modalBox.length){$("body").css("overflow","hidden");setTimeout(function(){var $modal=self.modalBox;self.backdrop.show();$modal.show();var $first=$modal.find(focusableElements).filter(":visible").first();var $last=$modal.find(focusableElements).filter(":visible").last();$first.off("keydown.acms-module-dialog").on("keydown.acms-module-dialog",function(e){if(e.which===9&&e.shiftKey){e.preventDefault();$last.focus()}});$last.off("keydown.acms-module-dialog").on("keydown.acms-module-dialog",function(e){if(e.which===9&&!e.shiftKey){e.preventDefault();$first.focus()}});$first.focus();$modal.removeClass("out").delay(200).queue(function(){$(this).addClass("in").delay(500).queue(function(){$(this).addClass("display").removeClass("in");ACMS.dispatchEvent("acmsDialogOpened",document,{item:document})}).dequeue()});self.resize($modal)},200);ACMS.Dispatch(self.modalBox)}self.setListAction();if(self.type==="index"){self._previewModule(mid,tpl)}}})};ACMS.Dispatch.ModuleDialog.prototype.setListAction=function(){var self=this;$(".acms-admin-modal-hide").bind("click",function(){self.closeFn()});self.modalBox.click(function(event){var click=event.target;if($(click).hasClass("acms-admin-modal")){self.closeFn()}});$(".js-layout_preview_module_id").bind("click",{self:self},self.previewModule)};ACMS.Dispatch.ModuleDialog.prototype.setPreviewAction=function(){var self=this;$(".js-layout_select_module_id").unbind("click").bind("click",{self:self},self.selectModule);$(".js-acms_layout_edit_module, .js-acms_layout_create_module").unbind("click").bind("click",{self:self},self.editModule);$(".js-acms_layout_dup_module").unbind("click").bind("click",{self:self},self.dupModule);$(".js-acms_layout_select_template").unbind("change").bind("change",function(){self._previewModule($(this).data("mid"),$(this).val());return false})};ACMS.Dispatch.ModuleDialog.prototype.selectModule=function(event){var mid=$(this).data("mid");var tpl=$(this).data("tpl");var query=ACMS.Library.queryToObj();if(!tpl)tpl="";query["mid"]=mid;query["tpl"]=tpl;query["layout"]="edit";$.ajax({type:"GET",url:ACMS.Library.acmsLink({tpl:"ajax/module/view.html",Query:query},false),dataType:"html",success:function(res){event.data.self.callback(decodeURIComponent(res),mid,tpl);event.data.self.closeFn()}});return false};ACMS.Dispatch.ModuleDialog.prototype.previewModule=function(event){var mid=$(this).data("mid");var tpl=$(this).data("tpl");if(!tpl)tpl="";event.data.self._previewModule(mid,tpl)};ACMS.Dispatch.ModuleDialog.prototype._previewModule=function(mid,tpl){var self=this,search="[data-mid="+mid+"]";$(".js-module_index_table").find(".js-layout_preview_module_id").removeClass("acms-admin-layout-sidebar-item-active");if(!!mid){ACMS.Dispatch.splash();$(".js-module_index_table").find(search).addClass("acms-admin-layout-sidebar-item-active");$.ajax({type:"GET",url:ACMS.Library.acmsLink({tpl:"ajax/module/preview.json",Query:{mid:mid,tpl:tpl}},false),dataType:"json",success:function(json){ACMS.Dispatch.removeSplash();json.preview=decodeURIComponent(json.preview);moduleTmpl=_.template($("#js-module_info_tpl").html());$("#js-module_info_box").html(moduleTmpl({module:json}));$(".js-acms_layout_select_template").val(tpl);self.setPreviewAction()}})}else{self.setPreviewAction()}};ACMS.Dispatch.ModuleDialog.prototype.editModule=function(event){var self=event.data.self,mid=$(this).data("mid"),edit=isFinite(mid)?"update":"insert";var Dialog=new ACMS.Dispatch.ModuleDialog(edit,function(){self.reload()});Dialog.show(mid)};ACMS.Dispatch.ModuleDialog.prototype.dupModule=function(event){var mid=$(this).data("mid");ACMS.Dispatch.splash();$.ajax({type:"POST",url:ACMS.Library.acmsLink({Query:{mid:mid}},false),data:{ACMS_POST_Module_Duplicate:"submit",ajax:true},success:function(nmid){event.data.self.reload(event.data.self.targetMid,nmid)}})};ACMS.Dispatch.ModuleDialog.prototype.reload=function(mid,nmid){var query={mid:mid},self=this;$.ajax({type:"GET",url:ACMS.Library.acmsLink({tpl:"ajax/module/list.html",Query:query},false),dataType:"html",success:function(res){var $table=self.modalBox.find(".js-module_index_table"),$res=$(res).find(".js-module_index_table");ACMS.Dispatch.removeSplash();$table.html($res.html());ACMS.Dispatch(self.modalBox);ACMS.dispatchEvent("acmsDialogOpened",document,{item:document});self.setListAction();self.setPreviewAction();if(!!nmid){var target="[data-mid="+nmid+"]";$(".js-resize_to_window_height",res).scrollTop($(target).position().top)}}})};ACMS.Dispatch.ModuleDialog.prototype.closeFn=function(){var self=this;$("body").css("overflow","");window.location.hash="";self.backdrop.fadeOut(150,function(){self.backdrop.remove()});self.modalBox.removeClass("display").addClass("out");setTimeout(function(){self.modalBox.remove()},500);if(self.type=="insert"){self.callback()}return false};