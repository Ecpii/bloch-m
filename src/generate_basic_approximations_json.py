"""
Prints in JSON of all the basic aproximations used by qiskit's default configuration.
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
    gate_matrix = gate_matrix.replace("0.,", "0,")
    gate_matrix = gate_matrix.replace("1.,", "1,")
    gate_matrix = gate_matrix.replace("0.]", "0]")
    gate_matrix = gate_matrix.replace("1.]", "1]")
    print(f'{{"names":{gate_names},"matrix":{gate_matrix}}},', end="")

gateseq = res[-1]
gate_names = remove_whitespace(
    str(list(map(lambda gate: gate.name, gateseq.gates))).replace("'", '"')
)
gate_matrix = remove_whitespace(repr(gateseq.product)[6:-1])
print(f'{{"names":{gate_names},"matrix":{gate_matrix}}}', end="")
print("]", end="")
