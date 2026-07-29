const fs = require('fs');
const glob = require('glob'); // Not available by default, use custom traversal

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            if (!file.includes('node_modules') && !file.includes('dist')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.astro') || file.endsWith('.ts') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
files.push('./scripts/generate-content.js');

const oldNameRegex = /\[TÊN Ð?I LÝ\]|Kênh CTV ti?p th? di d?ng Viettel|Kênh CTV/g;
const newName = 'Ði?m Bán Hàng Online Hoàng Minh';

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Update agentCode
    if (content.includes("agentCode: 'GA'")) {
        content = content.replace(/agentCode: 'GA'/g, "agentCode: 'GB'");
        changed = true;
    }
    
    // Update name
    if (oldNameRegex.test(content)) {
        content = content.replace(oldNameRegex, newName);
        changed = true;
    }
    
    // Update specific text in PackageModal
    if (content.includes('G?i SMS Ðang Ký Ngay')) {
        content = content.replace(/"G?i SMS Ðang Ký Ngay"/g, '"M? ?ng d?ng SMS"');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
