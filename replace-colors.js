const fs = require('fs');
const path = require('path');

function replaceColors(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceColors(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            // Specifically target classes 
            content = content.replace(/text-white/g, 'text-foreground');
            content = content.replace(/bg-white/g, 'bg-foreground');
            content = content.replace(/border-white/g, 'border-foreground');
            content = content.replace(/bg-black/g, 'bg-background');

            // Lucide icon colors text-[var(--foreground)] to text-foreground
            content = content.replace(/text-\[var\(--foreground\)\]/g, 'text-foreground');

            fs.writeFileSync(fullPath, content);
        }
    }
}
replaceColors(path.join(__dirname, 'src'));

console.log('Replaced colors successfully!');
