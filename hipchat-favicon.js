(function() {
    var count = 0,
        blurred = document.webkitHidden,
        chatsElement = document.getElementById('chats'),
        chats = {},
        debug = true;

    var ResetCount = function() {
        count = 0;
         Tinycon.setBubble(0);
    }

    var BumpCount = function() {
		// Cap at 99 since the favicon can really only show two digits.
        if (count < 99) {
            count++;
        }

        Tinycon.setBubble(count);
    }

    // https://developers.google.com/chrome/whitepapers/pagevisibility
    document.addEventListener('webkitvisibilitychange', function() {
        if (document.webkitHidden) {
            blurred = true;
        } else {
            blurred = false;
            Tinycon.setBubble('');
        }
    });

    chatsElement.addEventListener('DOMNodeInserted', function(event){
        var element = event.target;

        // Ensure we have something legitimate.
        if (!element.tagName) {
            return;
        } else if (element.tagName.toLowerCase() != 'div') {
            return;
        }

        if (element.classList.contains('chat_display')) {
            // A new chat has appeared, mark the chat in our state index so we
            // suppress chat notifications from it until we receive the
            // welcomeMessage chatBlock.
            var jid = element.attributes.getNamedItem('name').value;
            chats[jid] = false;
            return;
        }

        // Actual chat blocks are wrapped in a classless div.  Peek inside to
        // the first child to inspect whether it's something we do care about.
        if (element.classList.length == 0 && element.childNodes[0] && element.childNodes[0].classList.contains('chatBlock')) {
            var chatBlockElement = element.childNodes[0];

            if (chatBlockElement.classList.contains('me') && !debug) {
                // Don't care about messages from myself that were manually
                // entered or came from other sources.
                return;
            }

            // Find the chat_display container that holds this.
            // TODO: This bit is very brittle.  If HipChat change their DOM
            // structure this must be adjusted.
            var chatDisplayElement = chatBlockElement.parentNode;
            while (chatDisplayElement && !chatDisplayElement.classList.contains('chat_display')) {
                chatDisplayElement = chatDisplayElement.parentNode;
            }

            var jid = chatDisplayElement.attributes.getNamedItem('name').value;

            if (chatBlockElement.classList.contains('welcomeMessage')) {
                // The welcomeMessage chatBlock is a special message that
                // appears after all other chat has loaded.  We can now mark
                // the chat in our state index as being able to submit notice
                // of chat to the user.
                chats[jid] = true;
                return;
            }

            if (!chats[jid]) {
                return;
            }

            if (!blurred && !debug) {
                return;
            }

            BumpCount();
        }
    });
})();