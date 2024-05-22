"""
Prints in JSON of all the basic aproximations used by qiskit's default configuration.
The output is not necessarily valid JSON, since whole numbers are printed as
0., 1., or -1.
After manually picking these out, the result is valid JSON.
"""

from qiskit.synthesis.discrete_basis.generate_basis_approximations import (
    generate_basic_approximations,
)

whitespace_table = str.maketrans("a", "a", " \t\r\n\v")


def remove_whitespace(string):
    return string.translate(whitespace_table)


res = generate_basic_approximations(["h", "t", "tdg"], 10)
print("[", end="")
for gateseq in res[:-1]:
    gate_names = remove_whitespace(
        str(list(map(lambda gate: gate.name, gateseq.gates))).replace("'", '"')
    )
    gate_matrix = remove_whitespace(repr(gateseq.product)[6:-1])
    print(f'{{"names":{gate_names},"matrix":{gate_matrix}}},', end="")

gateseq = res[-1]
gate_names = remove_whitespace(
    str(list(map(lambda gate: gate.name, gateseq.gates))).replace("'", '"')
)
gate_matrix = remove_whitespace(repr(gateseq.product)[6:-1])
print(f'{{"gate_names":{gate_names},"gate_matrix":{gate_matrix}}}', end="")
print("]", end="")
