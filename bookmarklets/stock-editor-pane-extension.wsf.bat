<!-- :
@echo off&title %~n0
%windir%\System32\cscript.exe //nologo "%~f0?.wsf" %*
%ComSpec% /c exit %errorlevel%&goto:EOF
--->

<job id="foo">
<script language="VBScript">
  function vbinput(msg)
    vbinput = InputBox(msg)
  end function
</script>

<script language="JavaScript">
  (function() {
    var globals = (function() {
      return {
        "shell": WScript.CreateObject("WScript.Shell"),
        "fs"   : WScript.CreateObject("Scripting.FileSystemObject")
      };
    })();

    var favorites = globals.shell.SpecialFolders("Favorites"),
        favoriteLinks = globals.fs.BuildPath(favorites, 'Links'),
        host = vbinput("�T�[�o�[�h���C������͂��Ă��������B"),
        code = vbinput("�X�܃R�[�h��3���œ��͂��Ă��������B"),
        path = globals.fs.BuildPath(favoriteLinks, '�݌ɒ���.url'),
        shortcut = globals.shell.CreateShortcut(path),
        script = "javascript:(function(){var s=document.createElement('script');s.setAttribute('language','javascript');s.setAttribute('type','text/javascript');s.setAttribute('src','https://" + host + "/static/js/stock-editor-pane-extension.js?store=" + code + "');s.setAttribute('charset','utf-8');document.body.appendChild(s);})();";

    shortcut.TargetPath = script;
    shortcut.Save();
    shortcut = null;
  })();
  WScript.Echo("�I��");
</script>
</job>
