const fs = require('fs');
const path = process.argv[2];
if (!path) {
  console.error('Usage: node render_page_md.js <pageN.json>');
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
let md = `# Property Listings\n\n`;
data.forEach((prop, i) => {
  md += `## ${prop.title || prop.address}\n`;
  if (prop.imageUrl) {
    md += `![cover image](${prop.imageUrl})\n`;
  }
  md += `- **Price:** ${prop.price}\n`;
  md += `- **Bedrooms:** ${prop.bedrooms}\n`;
  md += `- **Bathrooms:** ${prop.bathrooms}\n`;
  md += `- **Car Spaces:** ${prop.carspaces}\n`;
  md += `- **Type:** ${prop.type}\n`;
  if (prop.available) md += `- **Available:** ${prop.available}\n`;
  if (prop.inspections && prop.inspections.length) md += `- **Inspections:** ${prop.inspections.join('; ')}\n`;
  if (prop.description) md += `\n${prop.description}\n`;
  md += `- **[View Listing](${prop.url})**\n`;
  md += `\n---\n\n`;
});
const outPath = path.replace(/\.json$/, '.md');
fs.writeFileSync(outPath, md);
console.log(`Wrote ${outPath}`); 