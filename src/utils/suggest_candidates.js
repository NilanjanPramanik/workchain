export function suggest_candidates(required_skills, candidates, candidates_skills, skill_replacements) {
  var req_skill = [];
  for (skill of required_skills){
    req_skill.push(skill_replacements[skill]);
  }
  // Filter candidates based on required skills

  const filtered_candidates = candidates.filter((candidate, index) => {
    const candidate_skills = candidates_skills[index].split(",").map(skill => skill.trim());
    return req_skill.every(skill => candidate_skills.includes(skill));
  });

  // Sort candidates based on the number of matching skills
  const sorted_candidates = filtered_candidates.sort((a, b) => {
    const a_skills = candidates_skills[candidates.indexOf(a)].split(",").map(skill => skill.trim());
    const b_skills = candidates_skills[candidates.indexOf(b)].split(",").map(skill => skill.trim());
    return b_skills.length - a_skills.length;
  });

  return sorted_candidates;
}
console.log(suggest_candidates(["solidity", "python"], ["Alice", "Bob", "Charlie"], ["solidity, python", "python, javascript", "solidity, javascript"], {"solidity": "solidity", "python": "python"}));