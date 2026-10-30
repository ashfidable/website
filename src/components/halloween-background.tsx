// Keep each drawing in one text node: detail adds characters, not DOM elements.
const ghost = String.raw`          .-"""""-.
        .'  .   .  '.
       /   .     .   \
      /  .         .  \
     |    .--. .--.    |
     |   / oo | oo \   |
     |   \____|____/   |
     |        __       |
     |       /  \      |
    /|       \__/      |\
   / |  .          .   | \
  /  |   :        :    |  \
 / . |   :   .    :    | . \
| /| |   :   :    :    | |\ |
|/ | |   :   :    :    | | \|
   | /\  :   :    :   /\|
   |/  \    /\    /\ /  '
   '    \__/  \__/  '`;

const bat = String.raw`    /\                           /\
   /  '.         /\ /\         .'  \
  /     '-.     /  V  \     .-'     \
 /   .     '-._| o   o |_.-'     .   \
/  .'  .       \  ^  /       .  '.  \
| /   /  .      |\_/|      .  \   \ |
|/   /  / '.    |   |    .' \  \   \|
'   /  /    '. /|   |\ .'    \  \   '
   |  /       / |   | \       \  |
   | /\     .'  |   |  '.     /\ |
   |/  \  .'    /   \    '.  /  \|
        \/\    / /^\ \    /\/
           \  /\/   \/\  /
            \/         \/`;

const pumpkin = String.raw`               ___
              / .'
             / /   _
         ___/ /__.' )
      .-'   \|   '-'
    .'   .   |   .   '.
   /    /    |    \    \
  /    /     |     \    \
 ;    ;  /\     /\  ;    ;
 |    | /##\   /##\ |    |
 |    |             |    |
 |    |     /\      |    |
 ;    ;     \/      ;    ;
  \   \  \_      _/ /   /
   \   \  | |__| | /   /
    '.  '.\______/.  .'
      '-._   |   _.-'
          '-----'`;

/** CSS ties visibility to the saved theme before React hydrates. */
export function HalloweenBackground() {
  return (
    <div className="halloween-background" aria-hidden="true">
      <pre className="halloween-friend halloween-ghost-one">{ghost}</pre>
      <pre className="halloween-friend halloween-bat-one">{bat}</pre>
      <pre className="halloween-friend halloween-ghost-two">{ghost}</pre>
      <pre className="halloween-friend halloween-bat-two">{bat}</pre>
      <pre className="halloween-friend halloween-pumpkin">{pumpkin}</pre>
    </div>
  );
}
