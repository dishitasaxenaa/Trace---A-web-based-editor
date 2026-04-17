export const MOCK_CODE = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))`;

export const MOCK_OUTPUT = {
  stdout: "[0, 1]",
  stderr: "",
  time: "0.043s",
  memory: "3.8 MB",
  status: "Accepted",
};

export const DEFAULT_AI_RESPONSE = `I can help you understand, debug, or improve your code. Try a quick action above.`;

export const MOCK_AI_RESPONSES = {
  "Explain Code": `This solves the Two Sum problem using a hash map for O(n) time.`,
  "Analyze Complexity": `Time Complexity: O(n). Space Complexity: O(n).`,
  "Optimize": `Already optimal for unsorted input.`,
  "Get Hints": `Hint: Use a hash map to store seen values while iterating.`,
};